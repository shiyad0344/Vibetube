import {Router} from 'express';
import { getMyVideos, 
    getAllVideos, 
    publishAVideo, 
    getVideoById, 
    updateVideo, 
    deleteVideo, 
    togglePublishStatus } from '../controllers/video.controllers.js';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';

const router= Router();

router.use(verifyJWT); 

router.
route('/').
get(getAllVideos).
post(upload.fields([
    {name:'videoFile',maxCount:1},
    {name:'thumbnail',maxCount:1}]),
    publishAVideo);

router.
route('/:videoId').
get(getVideoById).
patch(
    upload.fields([
        {name:'thumbnail',maxCount:1}
    ]),
updateVideo).
delete(deleteVideo)

router.route('/toggle/publish/:videoId').patch(togglePublishStatus);
router.route('/myvideos/:userId').get(getMyVideos);


export default router;