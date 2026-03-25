import bcrypt from "bcryptjs";

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.error("Usage: npm run hash:password -- YOUR_PASSWORD_HERE");
  process.exit(1);
}

const hash = await bcrypt.hash(plainPassword, 10);

console.log("");
console.log("Plain password:");
console.log(plainPassword);
console.log("");
console.log("Bcrypt hash:");
console.log(hash);
console.log("");
console.log("Copy the hash into the SQL template for password_hash.");

