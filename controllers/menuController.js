import Menu from "../models/menuModel.js"

export const createMenu = async (req, res)=> {
    try {
        const {admin_id, category_id, name, desc, price, availability} = req.body;
        const img =  req.files?.img?.[0]?.path || null;

        if(!category_id){
            return res.status(400).json({message:"Category is required"});
        }

        const newMenu = new Menu({admin_id, category_id, name, desc, price, availability, img:img});
        await newMenu.save();

        return res.status(201).json({message: "Menu Created Successfully", menu:newMenu});

    } catch (error) {
        console.error(error)
        return res.status(500).json({message: "Menu not created"});
    }
};

export const getMenu = async (req,res) => {
    try {
       const menus = await Menu.find();
       res.status(200).json({
        success:true,
        message:"All menus",
        menus
       })
    } catch (err) {
        console.error("Error fetching menus", err);
        res.status(500).json({message:"Internal server error"});
    }
}


//get menu by category
export const getMenuByCategory = async (req, res) => {
    try {
        const {categoryId} = req.params;

        const menus = await Menu.find({category_id:categoryId, availability:true});
        return res.status(200).json({menus});
    } catch (error) {
       console.error(error);
       return res.status(500).json({message:"Error finding menus by category"}) 
    }
}

export const deleteMenu = async(req,res)=>{
    try {
        const {id} = req.params;
        const menu = await Menu.findByIdAndDelete(id);

        if(!menu){
            return res.status(404).json({message:"Menu not found"});
        }

        res.status(200).json({message:"Menu deleted successfully"});
    } catch (err) {
        res.status(500).json({message:error.message});
    }
}

export const getSingleMenu = async(req, res)=> {
    try {
        const menu = await Menu.findById(req.params.id);
        if(!menu){
            return res.status(404).json({message:"Menu Item not found"});
        }  
        res.status(200).json({success:true, message:"Single Menu Retrieved Successfully", menu})      
    } catch (err) {
        res.status(500).json({success:false, message:"Server Error", error});      
    }
}