import { Router } from "express";
import { toggleSubscription,
    getUserChannelSubcriber,
    getSubscribedChannels
 } from "../controllers/subscription.controllers";
 import { verifyJWT } from "../middlewares/auth.middlewares";


const router= Router();

router.use(verifyJWT);

router.route('/c/:channelId').
       get(getUserChannelSubcriber).
       post(toggleSubscription)

router.route('/u/:subscriberId').get(getSubscribedChannels);

export default router;