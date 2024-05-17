const mongoose=require('mongoose');
const initData=require('../init/data.js');
const blog=require('../models/blog.js');

const MONGO_URL="mongodb://127.0.0.1:27017/Blog";

main()
.then(()=>{
    console.log("connect to DB")
})
.catch((err)=>{
    console.log(err)
});
async function main(){
    await mongoose.connect(MONGO_URL)
}
const initDB=async()=>{
    initData.data=initData.data.map((Obj)=>({...Obj, owner:"6641a33b7cb2934fe1017303"}));
    await blog.insertMany(initData.data)
    console.log("data was inilisized");
};
initDB();