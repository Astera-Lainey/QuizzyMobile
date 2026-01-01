import Notification from "../models/notification.js";

async function getAllNotifications(req, res){
    try{
        const notifications = await Notification.findAll();
        return res.status(200).json(notifications);
    }catch(error){
        console.log("Error Fetching Notifications: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function getNotificationsByStudentId(req, res){
    try{
        const notifications = await Notification.findAll({
        where: { studentId: req.params.studentId }
     });
        if (notifications) {
            return res.status(200).json(notifications);
        }else {
            return res.status(404).json({ error: "No Notifications Found" });
        }
    }catch(error){
        console.log("Error Fetching Notifications by Student: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function createNotification(req, res){
    try{
        const newNotification = await Notification.create({
            message: req.body.message,
            title: req.body.title,
            matricule: req.body.matricule,
            sentAt: new Date(),
            type: req.body.type,
            adminId: req.body.adminId,
        });
        return res.status(201).json(newNotification);
    }
    catch(error){
        console.log("Error Creating Notification: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function updateNotification(req, res){
    try{
        const notification = await Notification.findByPk(req.params.notificationId);
        if(notification){
            notification.message = req.body.message || notification.message;
            notification.title = req.body.title || notification.title;
            notification.type = req.body.type || notification.type;

            await notification.save();
            return res.status(200).json(notification);
        }else{
            return res.status(404).json({ error: "Notification Not Found" });
        }
    }catch(error){
        console.log("Error Updating Notification: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function deleteNotification(req, res){
    try{
        const notification = await Notification.findByPk(req.params.notificationId);
        if(notification){
            await notification.destroy();
            return res.status(200).json({message: "Notification Deleted Successfully"});
        }else{
            return res.status(404).json({ error: "Notification Not Found" });
        }
    }catch(error){
        console.log("Error Deleting Notification: ", error);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

export default{
    getAllNotifications,
    getNotificationsByStudentId,
    createNotification,
    updateNotification,
    deleteNotification
};