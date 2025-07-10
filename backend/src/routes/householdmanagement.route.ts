import {Router} from 'express';

import * as rawHouseholdController from "../controllers/household.controller";
import { wrapControllers } from '../utils/wrapControllers';
import { authenticationMiddleware } from '../middlewares/authentication.middleware';
const householdController = wrapControllers(rawHouseholdController);
const router =Router();



// routes for household management

router.post('/',authenticationMiddleware,householdController.createHousehold);
router.get('/me',authenticationMiddleware,householdController.getHouseholdById);
router.put('/:id/members/:userId',authenticationMiddleware,householdController.updateHouseholdMember);
router.delete('/:id/members/:userId',authenticationMiddleware,householdController.removeHouseholdMember);
router.get('/search-user',authenticationMiddleware,householdController.searchUserToInvite);
router.post('/:id/invite',authenticationMiddleware,householdController.inviteUserToHousehold);
router.post('/invitations/:invitationId/respond',authenticationMiddleware,householdController.respondToInvitation);
router.get('/invitations/me',authenticationMiddleware,householdController.getMyInvitations);
export default router;