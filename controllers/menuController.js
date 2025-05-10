import Menu from "../models/menuModel.js"

export const createMenu = async (req, res)=> {
    try {
        const {admin_id, category_id, name, desc, price, availability} = req.body;

        if(!category_id){
            return res.status(400).json({message:"Category is required"});
        }

        const newMenu = new Menu({admin_id, category_id, name, desc, price, availability});
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