const conversationRepository = require('../repositories/conversationRepository');
const supportTicketRepository = require('../repositories/supportTicketRepository');
const messageService = require('./messaging/messageService');
const participantService = require('./messaging/participantService');
const notificationService = require('./messaging/notificationService');
const AppError = require('../utils/AppError');

const PRIORITY_MAP = {
    Account: 'Medium',
    'Property Listing': 'Medium',
    'Builder Verification': 'Medium',
    'Report Listing': 'High',
    'Technical Issue': 'High',
    Payments: 'High',
    'Feature Request': 'Low',
    Other: 'Medium',
};

const VALID_CATEGORIES = Object.keys(PRIORITY_MAP);

const STATUS_TRANSITIONS = {
    Open: ['In Progress', 'Closed'],
    'In Progress': ['Waiting for User', 'Resolved', 'Closed'],
    'Waiting for User': ['In Progress', 'Resolved', 'Closed'],
    Resolved: ['Closed', 'Open'],
    Closed: ['Open'],
};

class SupportTicketService {
    getPriorityForCategory(category) {
        return PRIORITY_MAP[category] || 'Medium';
    }

    async createTicket(userId, { category, subject, description }) {
        if (!VALID_CATEGORIES.includes(category)) {
            throw new AppError('Invalid category', 400);
        }
        if (!subject?.trim()) {
            throw new AppError('Subject is required', 400);
        }
        if (!description?.trim()) {
            throw new AppError('Description is required', 400);
        }

        const priority = this.getPriorityForCategory(category);

        const conversation = await conversationRepository.create({
            type: 'SUPPORT',
            created_by: userId,
        });
        await participantService.addParticipant(conversation.id, userId);

        const ticket = await supportTicketRepository.create({
            conversation_id: conversation.id,
            user_id: userId,
            category,
            subject: subject.trim(),
            description: description.trim(),
            priority,
            status: 'Open',
        });

        await messageService.sendMessage({
            conversationId: conversation.id,
            user: { id: userId, role: 'User' },
            message: description.trim(),
            messageType: 'TEXT',
            skipNotification: true,
        });
        

        return { ticket, conversation };
    }

    async getUserTickets(userId, filters) {
        return supportTicketRepository.findByUserId(userId, filters);
    }

    async getTicket(ticketId, user) {
        const ticket = await supportTicketRepository.findById(ticketId);
        if (!ticket) {
            throw new AppError('Ticket not found', 404);
        }

        const isOwner = String(ticket.user_id) === String(user.id);
        const isAdmin = user.role === 'Admin';
        const isAssigned = ticket.assigned_admin_id
            && String(ticket.assigned_admin_id) === String(user.id);

        if (!isOwner && !isAdmin && !isAssigned) {
            throw new AppError('Not authorized', 403);
        }

        return ticket;
    }

    async assignTicket(ticketId, adminId, actingAdmin) {
        const ticket = await this.getTicket(ticketId, actingAdmin);
        const updated = await supportTicketRepository.assignAdmin(ticketId, adminId);
        await participantService.addParticipant(ticket.conversation_id, adminId);

        const notification = await notificationService.createNotification({
            user_id: adminId,
            type: 'TICKET_ASSIGNED',
            title: 'Ticket assigned to you',
            body: `You have been assigned ticket: ${ticket.subject}`,
        });

        return { ticket: updated, notification };
    }

    async updateStatus(ticketId, newStatus, actingUser) {
        const ticket = await this.getTicket(ticketId, actingUser);
        if (actingUser.role !== 'Admin') {
            throw new AppError('Only admins can update ticket status', 403);
        }

        const allowed = STATUS_TRANSITIONS[ticket.status] || [];
        if (!allowed.includes(newStatus) && ticket.status !== newStatus) {
            throw new AppError(`Cannot transition from ${ticket.status} to ${newStatus}`, 400);
        }

        const closedAt = newStatus === 'Closed' ? new Date() : null;
        const updated = await supportTicketRepository.updateStatus(ticketId, newStatus, closedAt);

        if (newStatus === 'Resolved' || newStatus === 'Closed') {
            await notificationService.createNotification({
                user_id: ticket.user_id,
                type: 'TICKET_RESOLVED',
                title: `Ticket ${newStatus.toLowerCase()}`,
                body: `Your support ticket "${ticket.subject}" has been ${newStatus.toLowerCase()}.`,
            });
        }

        return updated;
    }

    async updatePriority(ticketId, priority, actingUser) {
        await this.getTicket(ticketId, actingUser);
        if (actingUser.role !== 'Admin') {
            throw new AppError('Only admins can update priority', 403);
        }
        if (!['Low', 'Medium', 'High'].includes(priority)) {
            throw new AppError('Invalid priority', 400);
        }
        return supportTicketRepository.updatePriority(ticketId, priority);
    }

    async addInternalNote(ticketId, adminUser, message) {
        const ticket = await this.getTicket(ticketId, adminUser);
        if (adminUser.role !== 'Admin') {
            throw new AppError('Only admins can add internal notes', 403);
        }
        return messageService.sendMessage({
            conversationId: ticket.conversation_id,
            user: adminUser,
            message,
            messageType: 'TEXT',
            isInternal: true,
            skipNotification: true,
        });
    }

    async getAllTickets(filters) {
        const tickets = await supportTicketRepository.findAll(filters);
        const count = await supportTicketRepository.countAll(filters);
        return { tickets, count };
    }

    async sendTicketMessage(ticketId, user, message) {
        const ticket = await this.getTicket(ticketId, user);
        if (ticket.status === 'Closed' && user.role !== 'Admin') {
            throw new AppError('This ticket is closed', 403);
        }
        return messageService.sendMessage({
            conversationId: ticket.conversation_id,
            user,
            message,
            messageType: 'TEXT',
        });
    }
}

module.exports = new SupportTicketService();
