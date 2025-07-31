// controllers/analyticsController.js
import HelpRequest from '../models/requestModel.js';
import User from '../models/userModel.js';
import VolunteerTask from '../models/volunteerTaskModel.js';

export const getDashboardAnalytics = async (req, res) => {
    try {
        const pendingRequests = await HelpRequest.countDocuments({ status: 'pending' });
        const resolvedRequests = await HelpRequest.countDocuments({ status: 'resolved' });
        const activeVolunteers = await User.countDocuments({ role: 'volunteer' });

        const requests = await HelpRequest.find({});
        const locationBreakdown = {};
        requests.forEach((r) => {
            if (r.location) {
                locationBreakdown[r.location] = (locationBreakdown[r.location] || 0) + 1;
            }
        });

        res.status(200).json({
            overview: {
                pendingRequests,
                resolvedRequests,
                activeVolunteers,
            },
            breakdowns: {
                locationBreakdown
            }
        });
    } catch (err) {
        console.error('Dashboard analytics error:', err);
        res.status(500).json({ message: 'Failed to load dashboard analytics' });
    }
};
