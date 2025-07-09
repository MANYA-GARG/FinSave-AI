import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/user.js";


passport.use( 
    new LocalStrategy(
        {usernameField: "email"},async (email, password, done) => {
    try{
        const user = await User.findOne({email});
        if(!user) return done(null, false,{meassage : "user not found"});
        const isMatch = await bcrypt.compare(password,user.password); 
        if(isMatch) return done(null,user); 
        else return done(null,false,{message: "incorrect password "});
    }
    catch(error){
        return done(error);
    }
  })
);

passport.serializeUser((user, done)=> {
     console.log("we are inside serializeuser");
     done(null, user._id);
});

passport.deserializeUser(async (_id, done)=> {
 try {
     console.log("we are inside deserializeuser");
     const user= await User.findById(_id);
     done(null, user);
    }
    catch(error){
        done(error);
    }
});