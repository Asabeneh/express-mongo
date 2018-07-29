const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const {studentsInfo} = require("./studentsInfo");
const mongoose = require('mongoose');
const {MongoClient} = require('mongodb');
const nodemailer = require('nodemailer');
const methodOverride = require('method-override');

const app = express();

app.set('view engine','ejs');
app.use(express.static(__dirname + '/assets')); 

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(fileUpload());


const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'gudukasa98@gmail.com',
        pass:'a2169598'
    }
});

app.use((req, res, next) => {

if(req.method ==='POST'){
    let {firstName,lastName,title, nationality,src,whySofterDeveloper,longTermVision,motivatesMe,favoriteQuote,joinedOn } = req.body;
    console.log(firstName,lastName,title,nationality)
    const applicantInfo = `<h1>Name:${firstName} ${lastName}</h1>
    <h4>Title:${title}</h4>
    <h4>Nationality:${nationality}</h4><p>Added on the page</p>`

    const mailOptions = {
        from:'asabeneh@gmail.com',
        to:'asabeneh@gmail.com',
        subject:'Sending Email using Node.js',
        html:`<h1>Applicant Info:${applicantInfo}`
    }
    
    transporter.sendMail(mailOptions,(e,info) => {
        if(e){
            console.log(e)
        }
        else{
            console.log('Email sent: ' + info.response)
        }
    });

}
    
next();
})


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODU_URI || 'mongodb://washera:Asab216216216@ds259111.mlab.com:59111/washera',{ useNewUrlParser: true });

const Student = mongoose.model('Student',{
    firstName:{
        type:String

    },
    lastName:{
        type:String

    },
    title:{
        type:String

    },
    nationality:{
        type:String

    },
    src:{
        type:String

    },
    alt:{
        type:String

    },
    skills:{
        type:Array
    },
    whySofterDeveloper:{
        type:String
    },
    longTermVision:{
        type:String
    },
    motivatesMe:{
        type:String
    },
    favoriteQuote:{
        type:String
    },
    joinedOn:{
        type:String
    }

})

// Student.collection.insert(studentsInfo)

app.delete('/', function (req, res) {
    res.send('DELETE request to homepage');
  });

app.get('/',(req,res) => {
    Student.find().then((doc) => {
        if(!doc){
            res.status(404).send('Not Found')
        }
        res.render('students',{studentsInfo: doc})
    },(e)=> {
        res.status(400).send(e)

    })
   
})

app.get('/students/api',(req, res) => {
    Student.find().then((doc) => {
        if(!doc){
            res.status(404).send('Not Found')
        }
        res.json(doc)
    },(e)=> {
        res.status(400).send(e)
    })
   
});

app.get('/students/api/:id', (req, res) => {
    const id = req.params.id;
    Student.findById(id).then((doc) => {
        if(!doc){
            res.status(404).send('Not Found')
        }
        res.json(doc)
    },(e)=> {
        res.status(400).send(e)
    })

});

app.get('/students/:id', (req, res) => {
    const id = req.params.id;

    Student.findById(id).then((doc) => {
        res.render("student", doc);
    },(e) => {
        res.render('notFound')
    });

});

app.get('/add-student',(req,res) =>{
    res.render('addStudent')
})


app.post('/students',(req, res) => {
    let skillList = req.body.skills.trim().split(', ');
     if (!req.files) return res
         .status(400)
         .send("No files were uploaded.");
        let sampleFile = req.files.src;

     // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
     // Use the mv() method to place the file somewhere on your server
     sampleFile.mv(
       __dirname + "/assets/images/" + sampleFile.name,
       function(err) {
         if (err) return res.status(500).send(err);

          req.body.src = sampleFile.name;
          req.body.alt = sampleFile.name.slice(0, sampleFile.name.length-4);
          req.body.skills = skillList;

          const newStudent = new Student({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            title: req.body.title,
            nationality: req.body.nationality,
            src: req.body.src,
            alt: req.body.alt,
            skills:req.body.skills,
            whySofterDeveloper:req.body.whySofterDeveloper,
            longTermVision:req.body.longTermVision,
            motivatesMe:req.body.motivatesMe,
            favoriteQuote:req.body.favoriteQuote,
            joinOn:req.body.joinedOn
          });

          newStudent.save().then((doc) => {
            console.log(JSON.stringify(doc, undefined, 4))
          },(e) => {
              console.log('Unable to save')
          })

             res.redirect("/");
       }
     );

});

app.delete('/students/:id',(req,res) => {
    const id = Number(req.params.id);
    let flag = true;
    for(let i = 0; i < studentsInfo.length; i++){
        if(studentsInfo[i]._id === id){
            studentsInfo.splice(i,1);
            flag = true;
            res.json(studentsInfo);
           break;
        }
    }
    if(!flag){
        res.render("notFound")
    }
    else{
        console.log('A user with Id is deleted');
        console.log('Deleted:',deletedUser)
        res.render('Student deleted',{student:studentsInfo})
        res.send('A user with Id is deleted')
    }
});

app.put("/students/edit", (req, res) => {
  const id = req.params.id;
  let flag = true;
  for (let i = 0; i < studentsInfo.length; i++) {
    if (studentsInfo[i]._id == id) {
      studentsInfo.splice(i, 1);
      flag = true;
      res.json(studentsInfo);
      break;
    }
  }
  if (!flag) {
    console.log("User was not found with this ID.");
    res.render("notFound");
  } else {
    console.log("A user with Id is deleted");
    console.log("Deleted:", deletedUser);
    res.render("Student deleted", { student: studentsInfo });
    res.send("A user with Id is deleted");
  }
});


app.listen(port,  () => {
    console.log(`Server is running on port ${port}....`)
});


