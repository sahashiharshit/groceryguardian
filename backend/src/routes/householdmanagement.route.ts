import { Router } from 'express';

import * as rawHouseholdController from "../controllers/household.controller.js";
import { wrapControllers } from '../utils/wrapControllers.js';
import { authenticationMiddleware } from '../middlewares/authentication.middleware.js';
const householdController = wrapControllers(rawHouseholdController);
const router = Router();

// routes for household management
// get invitations sent to the user.
router.get('/invitations/me', authenticationMiddleware, householdController.getMyInvitations);
// get household details including members  
router.get('/me', authenticationMiddleware, householdController.getHouseholdById);
// search users to invite to household by email or name
router.get('/search-user', authenticationMiddleware, householdController.searchUserToInvite);
// create a new household
router.post('/', authenticationMiddleware, householdController.createHousehold);
// invite a user to household by userId
router.post('/:id/invite', authenticationMiddleware, householdController.inviteUserToHousehold);
// respond to household invitation
router.post('/invitations/:invitationId/respond', authenticationMiddleware, householdController.respondToInvitation);
// update household members
router.put('/:id/members/:userId', authenticationMiddleware, householdController.updateHouseholdMember);
// leave household
router.delete('/leave', authenticationMiddleware, householdController.leaveHousehold);
// delete household
router.delete('/:id', authenticationMiddleware, householdController.deleteHousehold);
// remove a member from household by userId
router.delete('/:id/members/:userId', authenticationMiddleware, householdController.removeHouseholdMember);
export default router;