import { Router,Request,Response } from "express";
import { db } from "../db";
import { NewUser, users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const authRouter = Router();

interface SignupBody {
    name: string;
    email: string;
    password: string;
}

interface LoginBody {
    email: string;
    password: string;
}

authRouter.post("/signup", async (req: Request<{},{},SignupBody>, res : Response) => {
    try {
        //get req body
      const {name , email , password} =   req.body;
        //check if the user already exist 
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length) {
            res.status(400).json({ msg: "User with the same email already exist" });
            return;
        }
        // hashed pw
      const hashedPassword = await  bcryptjs.hash(password, 8);
        //create a new user and store in db 
        const newUser: NewUser = {
            name,
            email,
            password: hashedPassword,
        }

        const [user] = await db.insert(users).values(newUser).returning();
        res.status(201).json(user);

    } catch (e) {
        res.status(500).json({ error: e });
    }
})


authRouter.post("/signin", async (req: Request<{},{},LoginBody>, res : Response) => {
    try {
        //get req body
      const { email , password} =   req.body;
        //check if the user doensot exist 
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));
        if (!existingUser) {
            res.status(400).json({ msg: "User with the  email does not exist" });
            return;
        }
        // hashed pw
        const isMatch = await bcryptjs.compare(password, existingUser.password);
        
        if (!isMatch) {
            res.status(400).json({ msg: "Incorrect password!" });
            return;
        }
        const token = jwt.sign({ id: existingUser.id }, "passwordKey", );
        res.json({ ...existingUser, token });

    } catch (e) {
        res.status(500).json({ error: e });
    }
})

authRouter.get("/", (req, res) => {
    res.send("Hey there! from auth");
})

export default authRouter;