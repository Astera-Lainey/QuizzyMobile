import Administrator from "../models/administrator.js";

async function createAdmin(req, res) {
    try{
        const admin = await Administrator.findByPk(req.body.email);

        if (admin) {
            const affectedRows = await Administrator.restore({
                where: {
                    email: req.body.email,
                }
            });

            if (affectedRows > 0){
                res.status(200).json("Admin Successfully Restored");
            }else{
                res.status(200).json("Admin Already Exists");
            }
        }else{
            const newAdmin = Administrator.build({
                email: req.body.email,
                password: req.body.password,
                role: 'admin',
            })
            await newAdmin.save();
            res.status(201).json(newAdmin);
        }
    }catch(error){
        console.error("Unable to create admin: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function updateAdmin(req, res){
    try{
        const admin = await Administrator.findByPk(req.params.adminId);
        if(admin){
            admin.password = req.body.password || admin.password;
            await admin.save();
            res.status(200).json(admin);
        }else{
            res.status(404).json("Admin Not Found");
        }
    }catch(error){
        console.error("Error updating admin: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export default {createAdmin, updateAdmin};