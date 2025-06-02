export const validateRegister = (req, res, next) => {
  // Middleware to validate user registration input
  const { name, email,mobileNo, password } = req.body;
  console.log(name,email,mobileNo,password);
  // Check if all fields are provided
  if (!name || !email || !mobileNo|| !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if name is at least 3 characters long
  if (name.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Name must be at least 3 characters long" });
  }

  // Simple email regex for validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  //check for mobile no
  const cleaned = mobileNo.replace(/[\s-]/g,'');
  const regex = /^(\+?\d{1,3})?([6-9]\d{9})$/;
  const match = cleaned.match(regex);
  if(!match){
    return res.status(400).json({ message: "Invalid Number format" });
  }
 // const formattedNumber = `+${match[1]?match[1].replace('+',''):'91'}${match[2]}`;
  // Check if password is at least 8 characters long
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  
  if (!password || !passwordRegex.test(password)) {
    return res
      .status(400)
      .json({
        error:
          "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.",
      });
  }

  next();
};

export const validateLogin = (req, res, next) => {
const { email, password } = req.body;

 if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
next();

}