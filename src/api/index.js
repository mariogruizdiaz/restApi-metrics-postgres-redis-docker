import express from 'express';

import user from './user.js';
import session from './session.js';
import increment from './increment.js';

const {Router} = express;
const router = new Router();

router.use('/api/users', user);
router.use('/api/sessions', session);
router.use('/api/increment', increment);

export default router;
