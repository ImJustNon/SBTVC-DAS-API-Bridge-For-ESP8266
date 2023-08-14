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
        port: process.env.PORT || 8080
    },
    api: {
        main: {
            host: "https://sbtvc-das-api.nonlnwza.xyz"
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


app.post("/bridge/api/auth/esp/auth_reseiver", urlEncoded, async(req, res) =>{
    const { secret_key, location_auth_id, type, for_ } = req.body ?? {};

    if(!secret_key || !location_auth_id || !type || !for_){
        return res.json({
            status: "FAIL",
            error: "Please provide 'location_auth_id', 'type', 'for_' query"
        });
    }

    try{    
        const response = await axios.post(`${config.api.main.host}/api/auth/esp/auth_receiver`, {
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


app.listen(config.app.port, () =>{
    console.log("start server on PORT : " + config.app.port + " => " + "http://127.0.0.1:" + config.app.port);
});