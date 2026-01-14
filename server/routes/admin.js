import express from 'express';
import bcrypt from 'bcryptjs';
import { getOne, getAll, runQuery } from '../config/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { sendEmail } from '../utils/emailService.js';
import { VALID_STATUSES } from '../utils/validators.js';

const router = express.Router();

// ==================== AUTH ROUTES ====================

/**
 * POST /api/admin/login
 * Admin authentication
 */
router.post('/login', loginLimiter, (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required',
                code: 'MISSING_CREDENTIALS'
            });
        }

        const admin = getOne('SELECT * FROM admins WHERE username = ?', [username]);

        if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Update last login
        const now = new Date().toISOString();
        runQuery('UPDATE admins SET last_login = ? WHERE id = ?', [now, admin.id]);

        // Generate token
        const token = generateToken(admin);

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * POST /api/admin/logout
 * Admin logout (client-side token removal)
 */
router.post('/logout', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ==================== DASHBOARD ROUTES ====================

/**
 * GET /api/admin/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats', authenticateToken, (req, res) => {
    try {
        // Total applications
        const totalAppsResult = getOne('SELECT COUNT(*) as count FROM applications');
        const totalApps = totalAppsResult?.count || 0;

        // Status counts
        const statusCounts = getAll(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);

        const statusMap = {};
        VALID_STATUSES.forEach(s => statusMap[s] = 0);
        statusCounts.forEach(row => {
            statusMap[row.status] = row.count;
        });

        // Talent counts
        const allApps = getAll('SELECT talents FROM applications');
        const talentCounts = {};
        allApps.forEach(app => {
            try {
                const talents = JSON.parse(app.talents || '[]');
                talents.forEach(talent => {
                    talentCounts[talent] = (talentCounts[talent] || 0) + 1;
                });
            } catch (e) { }
        });

        // Department counts
        const deptCounts = getAll(`
      SELECT department, COUNT(*) as count 
      FROM applications 
      GROUP BY department 
      ORDER BY count DESC
    `);

        const departmentMap = {};
        deptCounts.forEach(row => {
            departmentMap[row.department] = row.count;
        });

        // Level counts
        const levelCounts = getAll(`
      SELECT level, COUNT(*) as count 
      FROM applications 
      GROUP BY level 
      ORDER BY level
    `);

        const levelMap = {};
        levelCounts.forEach(row => {
            levelMap[row.level] = row.count;
        });

        // Recent applications (last 10)
        const recentApps = getAll(`
      SELECT id, ref_number, full_name, email, department, status, submitted_at
      FROM applications 
      ORDER BY submitted_at DESC 
      LIMIT 10
    `);

        // Applications timeline (last 30 days)
        const timeline = getAll(`
      SELECT DATE(submitted_at) as date, COUNT(*) as count
      FROM applications
      WHERE submitted_at >= datetime('now', '-30 days')
      GROUP BY DATE(submitted_at)
      ORDER BY date
    `);

        // Today's count
        const todayResult = getOne(`
      SELECT COUNT(*) as count FROM applications 
      WHERE DATE(submitted_at) = DATE('now')
    `);
        const todayCount = todayResult?.count || 0;

        // This week's count
        const weekResult = getOne(`
      SELECT COUNT(*) as count FROM applications 
      WHERE submitted_at >= datetime('now', '-7 days')
    `);
        const weekCount = weekResult?.count || 0;

        // This month's count
        const monthResult = getOne(`
      SELECT COUNT(*) as count FROM applications 
      WHERE submitted_at >= datetime('now', '-30 days')
    `);
        const monthCount = monthResult?.count || 0;

        // Average rating (for rated applications)
        const avgRatingResult = getOne(`
      SELECT AVG(rating) as avg FROM applications WHERE rating > 0
    `);
        const avgRating = avgRatingResult?.avg;

        // Acceptance rate
        const acceptedCount = statusMap['Accepted'] || 0;
        const acceptanceRate = totalApps > 0
            ? ((acceptedCount / totalApps) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            stats: {
                totalApplications: totalApps,
                applicationsToday: todayCount,
                applicationsThisWeek: weekCount,
                applicationsThisMonth: monthCount,
                statusCounts: statusMap,
                talentCounts,
                departmentCounts: departmentMap,
                levelCounts: levelMap,
                recentApplications: recentApps.map(app => ({
                    id: app.id,
                    refNumber: app.ref_number,
                    fullName: app.full_name,
                    email: app.email,
                    department: app.department,
                    status: app.status,
                    submittedAt: app.submitted_at
                })),
                applicationsTimeline: timeline,
                averageRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
                acceptanceRate: parseFloat(acceptanceRate)
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats',
            code: 'SERVER_ERROR'
        });
    }
});

// ==================== APPLICATION MANAGEMENT ROUTES ====================

/**
 * GET /api/admin/applications
 * Get all applications with filtering, searching, and pagination
 */
router.get('/applications', authenticateToken, (req, res) => {
    try {
        const {
            search,
            status,
            department,
            level,
            talent,
            dateFrom,
            dateTo,
            sortBy = 'submitted_at',
            sortOrder = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        let whereClauses = [];
        let params = [];

        // Search filter
        if (search) {
            whereClauses.push(`(
        full_name LIKE ? OR 
        email LIKE ? OR 
        phone LIKE ? OR 
        ref_number LIKE ?
      )`);
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Status filter
        if (status && status !== 'All') {
            whereClauses.push('status = ?');
            params.push(status);
        }

        // Department filter
        if (department && department !== 'All') {
            whereClauses.push('department = ?');
            params.push(department);
        }

        // Level filter
        if (level && level !== 'All') {
            whereClauses.push('level = ?');
            params.push(level);
        }

        // Talent filter
        if (talent && talent !== 'All') {
            whereClauses.push('talents LIKE ?');
            params.push(`%"${talent}"%`);
        }

        // Date filters
        if (dateFrom) {
            whereClauses.push('DATE(submitted_at) >= ?');
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClauses.push('DATE(submitted_at) <= ?');
            params.push(dateTo);
        }

        const whereClause = whereClauses.length > 0
            ? 'WHERE ' + whereClauses.join(' AND ')
            : '';

        // Validate sort column
        const validSortColumns = ['submitted_at', 'full_name', 'email', 'department', 'level', 'status', 'rating', 'ref_number'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'submitted_at';
        const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        // Get total count
        const countResult = getOne(`
      SELECT COUNT(*) as count FROM applications ${whereClause}
    `, params);

        const totalCount = countResult?.count || 0;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const offset = (pageNum - 1) * limitNum;
        const totalPages = Math.ceil(totalCount / limitNum);

        // Get applications
        const applications = getAll(`
      SELECT * FROM applications 
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT ? OFFSET ?
    `, [...params, limitNum, offset]);

        // Parse JSON fields
        const parsedApps = applications.map(app => ({
            id: app.id,
            refNumber: app.ref_number,
            fullName: app.full_name,
            email: app.email,
            phone: app.phone,
            department: app.department,
            level: app.level,
            talents: JSON.parse(app.talents || '[]'),
            instruments: app.instruments,
            otherTalent: app.other_talent,
            previousExperience: app.previous_experience,
            experienceDetails: app.experience_details,
            motivation: app.motivation,
            hopesToGain: app.hopes_to_gain,
            availability: JSON.parse(app.availability || '[]'),
            auditionSlot: app.audition_slot,
            status: app.status,
            adminNotes: app.admin_notes,
            rating: app.rating,
            tags: JSON.parse(app.tags || '[]'),
            submittedAt: app.submitted_at,
            updatedAt: app.updated_at,
            statusHistory: JSON.parse(app.status_history || '[]')
        }));

        res.json({
            success: true,
            applications: parsedApps,
            totalCount,
            page: pageNum,
            totalPages,
            limit: limitNum
        });

    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch applications',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * GET /api/admin/applications/:id
 * Get single application details
 */
router.get('/applications/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;

        const app = getOne('SELECT * FROM applications WHERE id = ?', [id]);

        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                code: 'NOT_FOUND'
            });
        }

        const parsedApp = {
            id: app.id,
            refNumber: app.ref_number,
            fullName: app.full_name,
            email: app.email,
            phone: app.phone,
            department: app.department,
            level: app.level,
            talents: JSON.parse(app.talents || '[]'),
            instruments: app.instruments,
            otherTalent: app.other_talent,
            previousExperience: app.previous_experience,
            experienceDetails: app.experience_details,
            motivation: app.motivation,
            hopesToGain: app.hopes_to_gain,
            availability: JSON.parse(app.availability || '[]'),
            auditionSlot: app.audition_slot,
            status: app.status,
            adminNotes: app.admin_notes,
            rating: app.rating,
            tags: JSON.parse(app.tags || '[]'),
            submittedAt: app.submitted_at,
            updatedAt: app.updated_at,
            statusHistory: JSON.parse(app.status_history || '[]')
        };

        res.json({
            success: true,
            application: parsedApp
        });

    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch application',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * PUT /api/admin/applications/:id
 * Update application
 */
router.put('/applications/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const app = getOne('SELECT * FROM applications WHERE id = ?', [id]);

        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                code: 'NOT_FOUND'
            });
        }

        const now = new Date().toISOString();
        let statusHistory = JSON.parse(app.status_history || '[]');

        // If status changed, add to history and send email
        if (updates.status && updates.status !== app.status) {
            statusHistory.push({
                status: updates.status,
                timestamp: now,
                updatedBy: req.admin.username
            });

            // Send status update email
            let templateType = null;
            if (updates.status === 'Audition Scheduled') templateType = 'audition_scheduled';
            else if (updates.status === 'Accepted') templateType = 'accepted';
            else if (updates.status === 'Waitlisted') templateType = 'waitlisted';
            else if (updates.status === 'Not Selected') templateType = 'not_selected';

            if (templateType) {
                await sendEmail(app.id, app.email, templateType, {
                    fullName: app.full_name,
                    refNumber: app.ref_number,
                    auditionSlot: updates.auditionSlot || app.audition_slot
                });
            }
        }

        // Build update query
        const updateFields = [];
        const updateParams = [];

        if (updates.status !== undefined) {
            updateFields.push('status = ?');
            updateParams.push(updates.status);
        }
        if (updates.adminNotes !== undefined) {
            updateFields.push('admin_notes = ?');
            updateParams.push(updates.adminNotes);
        }
        if (updates.rating !== undefined) {
            updateFields.push('rating = ?');
            updateParams.push(updates.rating);
        }
        if (updates.tags !== undefined) {
            updateFields.push('tags = ?');
            updateParams.push(JSON.stringify(updates.tags));
        }
        if (updates.auditionSlot !== undefined) {
            updateFields.push('audition_slot = ?');
            updateParams.push(updates.auditionSlot);
        }

        updateFields.push('updated_at = ?');
        updateParams.push(now);

        updateFields.push('status_history = ?');
        updateParams.push(JSON.stringify(statusHistory));

        updateParams.push(id);

        runQuery(`
      UPDATE applications 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateParams);

        // Fetch updated application
        const updatedApp = getOne('SELECT * FROM applications WHERE id = ?', [id]);

        res.json({
            success: true,
            application: {
                id: updatedApp.id,
                refNumber: updatedApp.ref_number,
                status: updatedApp.status,
                adminNotes: updatedApp.admin_notes,
                rating: updatedApp.rating,
                updatedAt: updatedApp.updated_at
            }
        });

    } catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update application',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * DELETE /api/admin/applications/:id
 * Delete application
 */
router.delete('/applications/:id', authenticateToken, (req, res) => {
    try {
        const { id } = req.params;

        const app = getOne('SELECT id FROM applications WHERE id = ?', [id]);

        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                code: 'NOT_FOUND'
            });
        }

        runQuery('DELETE FROM applications WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });

    } catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete application',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * POST /api/admin/applications/bulk-update
 * Bulk update applications
 */
router.post('/applications/bulk-update', authenticateToken, (req, res) => {
    try {
        const { applicationIds, updates } = req.body;

        if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'applicationIds must be a non-empty array',
                code: 'INVALID_INPUT'
            });
        }

        const now = new Date().toISOString();
        let updatedCount = 0;

        for (const id of applicationIds) {
            if (updates.status) {
                const app = getOne('SELECT status_history FROM applications WHERE id = ?', [id]);
                if (app) {
                    let history = JSON.parse(app.status_history || '[]');
                    history.push({ status: updates.status, timestamp: now, updatedBy: req.admin.username });

                    runQuery(`
            UPDATE applications 
            SET status = ?, updated_at = ?, status_history = ?
            WHERE id = ?
          `, [updates.status, now, JSON.stringify(history), id]);
                    updatedCount++;
                }
            }
        }

        res.json({
            success: true,
            updatedCount
        });

    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bulk update applications',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * DELETE /api/admin/applications/bulk-delete
 * Bulk delete applications
 */
router.delete('/applications/bulk-delete', authenticateToken, (req, res) => {
    try {
        const { applicationIds } = req.body;

        if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'applicationIds must be a non-empty array',
                code: 'INVALID_INPUT'
            });
        }

        let deletedCount = 0;
        for (const id of applicationIds) {
            runQuery('DELETE FROM applications WHERE id = ?', [id]);
            deletedCount++;
        }

        res.json({
            success: true,
            deletedCount
        });

    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bulk delete applications',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * GET /api/admin/applications/export
 * Export applications to CSV
 */
router.get('/applications/export', authenticateToken, (req, res) => {
    try {
        const { status, department, level, dateFrom, dateTo } = req.query;

        let whereClauses = [];
        let params = [];

        if (status && status !== 'All') {
            whereClauses.push('status = ?');
            params.push(status);
        }
        if (department && department !== 'All') {
            whereClauses.push('department = ?');
            params.push(department);
        }
        if (level && level !== 'All') {
            whereClauses.push('level = ?');
            params.push(level);
        }
        if (dateFrom) {
            whereClauses.push('DATE(submitted_at) >= ?');
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClauses.push('DATE(submitted_at) <= ?');
            params.push(dateTo);
        }

        const whereClause = whereClauses.length > 0
            ? 'WHERE ' + whereClauses.join(' AND ')
            : '';

        const applications = getAll(`
      SELECT * FROM applications ${whereClause} ORDER BY submitted_at DESC
    `, params);

        // Generate CSV
        const headers = [
            'RefNumber', 'Name', 'Email', 'Phone', 'Department', 'Level',
            'Talents', 'Status', 'Rating', 'Submitted', 'Notes'
        ];

        const rows = applications.map(app => [
            app.ref_number,
            `"${app.full_name.replace(/"/g, '""')}"`,
            app.email,
            app.phone,
            app.department,
            app.level,
            `"${JSON.parse(app.talents || '[]').join(', ')}"`,
            app.status,
            app.rating || 0,
            app.submitted_at,
            `"${(app.admin_notes || '').replace(/"/g, '""')}"`
        ]);

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

        const date = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="hudt-applications-${date}.csv"`);
        res.send(csv);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export applications',
            code: 'SERVER_ERROR'
        });
    }
});

/**
 * POST /api/admin/applications/:id/send-email
 * Send email to applicant
 */
router.post('/applications/:id/send-email', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, message } = req.body;

        const app = getOne('SELECT * FROM applications WHERE id = ?', [id]);

        if (!app) {
            return res.status(404).json({
                success: false,
                error: 'Application not found',
                code: 'NOT_FOUND'
            });
        }

        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                error: 'Subject and message are required',
                code: 'INVALID_INPUT'
            });
        }

        await sendEmail(app.id, app.email, 'custom', {
            subject,
            body: message,
            fullName: app.full_name,
            refNumber: app.ref_number
        });

        res.json({
            success: true,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email',
            code: 'SERVER_ERROR'
        });
    }
});

export default router;
