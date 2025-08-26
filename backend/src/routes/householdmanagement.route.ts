import { Router } from 'express';

import * as rawHouseholdController from "../controllers/household.controller.js";
import { wrapControllers } from '../utils/wrapControllers.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
const householdController = wrapControllers(rawHouseholdController);
const router = Router();



// routes for household management

router.post('/', authenticationMiddleware, householdController.createHousehold);
router.get('/me', authenticationMiddleware, householdController.getHouseholdById);
router.put('/:id/members/:userId', authenticationMiddleware, householdController.updateHouseholdMember);
router.delete('/:id/members/:userId', authenticationMiddleware, householdController.removeHouseholdMember);
router.get('/search-user', authenticationMiddleware, householdController.searchUserToInvite);
router.post('/:id/invite', authenticationMiddleware, householdController.inviteUserToHousehold);
router.post('/invitations/:invitationId/respond', authenticationMiddleware, householdController.respondToInvitation);
router.get('/invitations/me', authenticationMiddleware, householdController.getMyInvitations);
router.delete('/leave', authenticationMiddleware, householdController.leaveHousehold);
router.delete('/:id', authenticationMiddleware, householdController.deleteHousehold);
export default router;