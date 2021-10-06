import {Router} from 'express';
import {compare} from 'bcrypt';

import {find} from '../persistence/users.js';
import {create, deleteSession} from '../persistence/sessions.js';

import sessionMiddleware from '../middleware/session-middleware.js';

const router = new Router();

router.post('/', async (request, response) => {
  try {
    const {email, password} = request.body;
    if (!email || !password) {
        return response.status(401).send("Invalid parameters");
      }
    const user = await find(email);
    if (!user || !(await compare(password, user.password))) {
      return response.status(403).json({});
    }

    const sessionId = await create(user.id);
    request.session.id = sessionId;
    response.status(201).json();
  } catch (error) {
    console.error(
      `POST session ({ email: ${request.body.email} }) >> ${error.stack})`,
    );
    response.status(500).send('Something went wrong...');
  }
});

router.get('/', sessionMiddleware, (request, response) => {
  response.json({userId: request.userId});
});

router.delete('/', async (request, response) => {
  try {
    if (request.session.id) {
      await deleteSession(request.session.id);
    }

    request.session.id = null;
    response.status(200).json();
  } catch (error) {
    console.error(`deleteSession session >> ${error.stack}`);
    response.status(500).json();
  }
});

export default router;
