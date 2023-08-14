require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const morgan = require("morgan");

// cofig
const config = {
    app: {
        port: process.env.PORT || 1756
    },
    api: {
        sik: {
            main: {
                host: "https://success-i-know-api.vercel.app",
            },
        },
        sbtvc_das: {
            main: {
                host: "https://sbtvc-das-api.nonlnwza.xyz"
            }
        }
    }
}

const app = express();
const urlEncoded = bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
});
const jsonEncoded = express.json({
    limit: true,
});

app.use(cors());
app.use(morgan("dev"));
app.use(urlEncoded);
app.use(jsonEncoded);

// non
app.post("/api/bridge/sbtvc-das/api/auth/esp/auth_reseiver", urlEncoded, async(req, res) =>{
    const { secret_key, location_auth_id, type, for_ } = req.body ?? {};

    if(!secret_key || !location_auth_id || !type || !for_){
        return res.json({
            status: "FAIL",
            error: "Please provide 'location_auth_id', 'type', 'for_' query"
        });
    }

    try{    
        const response = await axios.post(`${config.api.sbtvc_das.main.host}/api/auth/esp/auth_receiver`, {
            secret_key : secret_key,
            location_auth_id: location_auth_id,
            type: type,
            for_: for_
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.data.status === "FAIL"){
            return res.json({
                status: "FAIL",
                error: response.data.error, 
            });
        } 
        return res.json({
            status: "SUCCESS",
            error: null,
            data: {
                results: response.data.data.results,
            },
        });
    }
    catch(err){
        return res.json({
            status: "FAIL",
            error: err,
        });
    }
});

// kao
app.post("/api/bridge/sik/api/status/change", urlEncoded, async(req, res) =>{
    const { machine_no, change_to } = req.body ?? {};

    if(!machine_no || !change_to){
        return res.json({
            status: "FAIL",
            error: "Please provide 'machine_no', 'change_to'"
        });
    }

    try{    
        const response = await axios.post(`${config.api.sik.main.host}/api/status/change`, {
            machine_no: machine_no,
            change_to: change_to,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.data.status === "FAIL"){
            return res.json({
                status: "FAIL",
                error: response.data.error, 
            });
        } 

        return res.json({
            status: "SUCCESS",
            error: null,
        });
    }
    catch(err){
        return res.json({
            status: "FAIL",
            error: err,
        });
    }
});

app.listen(config.app.port, () =>{
    console.log("start server on PORT : " + config.app.port + " => " + "http://127.0.0.1:" + config.app.port);
});