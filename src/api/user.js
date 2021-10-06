import {Router} from 'express';
import {create} from '../persistence/users.js';

const router = new Router();

router.post('/', async (request, response) => {
  try {
    const {email, password} = request.body;
    if (!email || !password) {
      return response
        .status(400)
        .json({message: 'email and password must be provided'});
    }

    const user = await create(email, password);
    if (!user) {
      return response.status(400).json({message: 'User already exists'});
    }

    return response.status(200).json(user);
  } catch (error) {
    console.error(
      `createUser({ email: ${request.body.email} }) >> Error: ${error.stack}`,
    );
    response.status(500).send('Something went wrong...');
  }
});

export default router;
