var app = require('express')();
var bodyParser = require('body-parser');
var port = process.env.PORT || 9000;
var mysql = require('mysql');
var mqtt = require('mqtt')
var dateTime = require('node-datetime');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('json spaces', 2);
app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With,content-type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);

    function handleDisconnect() {
        res.locals.connection = mysql.createConnection({
            host: "smdb.kku.ac.th",
            user: "coeadmin",
            password: "1q2w3e4r@coeadmin",
            database: "smart_farm",
            port: "1107"
        });
        
        res.locals.connection.connect(function(err) {
            if(err) {                               
                console.log('error when connecting to db:', err);
                setTimeout(handleDisconnect, 2000);
            }                                     
        });                                     
                                               
        res.locals.connection.on('error', function(err) {
            console.log('db error lost connection!');
            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();                      
            } else {                                     
                throw err;                                
            }
        });
    }

    handleDisconnect();

    return next();
});

/* Routing */
app.get('/gettemp',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT value,time,date from smartfarm where type='temp'"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
        }else{
            data["Data"] = 'No data Found..';
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/',function(req,res){
    var data = {};
	data["res"] = "welcome to smartfarm api";
    res.json(data);
    res.locals.connection.end();
});


app.get('/getallsensor',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT * from sensor_type"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = 'No data Found..';
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.post('/insertFarm',function(req,res){
    var farmId = req.body.farmId;
    var farmName = req.body.farmName;
    var farmType = req.body.farmType;
    var addedTime = req.body.addedTime;
    var data = {"Data":""};
    console.log("Insert Farm!");
    res.locals.connection.query("INSERT INTO farm(farm_id,farm_type,farm_name,upd_date) values (?,?,?,?)",[farmId,farmName,farmType,addedTime]
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }
    }); 
});

app.post('/insertSensor',function(req,res){
    var sensorId = req.body.sensorId;
    var sensorName = req.body.sensorName;
    var sensorDetail = req.body.sensorDetail;
    var sensorTable = req.body.sensorTable;
    var data = {"Data":""};
    console.log("Insert Sensor!");
    //res.json(sensorId + sensorName + sensorDetail + sensorTable);
    res.locals.connection.query("INSERT INTO sensor_type(sensor_type_id,sensor_name,sensor_detail,sensor_table) values (?,?,?,?)",[sensorId,sensorName,sensorDetail,sensorTable]
    ,function(err, rows, fields){
        if(err){
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
            throw err;
        }else{
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }
    }); 
});

app.post('/addSensorModule',function(req,res){
    var ModuleId = req.body.ModuleId;
    var moduleName = req.body.moduleName;
    var moduleDetail = req.body.moduleDetail;
    var addedTime = req.body.addedTime;
    var data = {"Data":""};
    console.log("add Sensor module!");
    res.locals.connection.query("INSERT INTO sensor_module(sensor_module_id,sensor_name,sensor_detail,upd_date) values (?,?,?,?)",[ModuleId,moduleName,moduleDetail,addedTime]
    ,function(err, rows, fields){
        if(err){
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
            throw err;
        }else{
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/getalltempvalue',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT * from sensor_temperature"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = 'No data Found..';
            res.json(data);
            res.locals.connection.end();
        }
    });
});


app.get('/getallhumvalue',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT * from sensor_huminity"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = 'No data Found..';
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/getallcarbonvalue',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT * from sensor_carbon"
    ,function(err, rows, fields){
        if(err){
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/getallsoilvalue',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT * from sensor_soil"
    ,function(err, rows, fields){
        if(err){
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/getstatusLED',function(req,res){
    var data = {};
    res.locals.connection.query("SELECT * from status_led"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = 'No data Found..';
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.post('/updateStatusLED',function(req,res){
    var ledStatus = req.body.ledStatus;
    var data = {"Status":""};
    console.log("Update led status : " + ledStatus);
    res.locals.connection.query("update status_led set status = ?",[ledStatus]
    ,function(err, rows, fields){
        if(err){
            data["Status"] = err;
            res.json(data);
            res.locals.connection.end();
            throw err;
        }else{
            data["Status"] = rows;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.post('/addFarmSensor',function(req,res){
    var farmId = req.body.farmId;
    var moduleId = req.body.moduleId;
    var setupLocation = req.body.setupLocation;
    var setupTime = req.body.setupTime;
    var data = {"Data":""};
    console.log("add Sensor module!");
    res.locals.connection.query("INSERT INTO farm_sensor(farm_id,sensor_module_id,upd_date) values (?,?,?)",[farmId,moduleId,setupTime]
    ,function(err, rows, fields){
        if(err){
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
            throw err;
        }else{
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/testgetfarmid',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    res.locals.connection.query("SELECT * FROM farm_sensor WHERE sensor_module_id = 1234;"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows[0];
            console.log(rows[0].farm_id)    
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/getLastTemp',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    res.locals.connection.query("select temperature from sensor_temperature order by id desc limit 1;"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.get('/testGetTempandHum',function(req,res){
    var data = {"Data":[]};
    var temp = {"temp":''};
    var hum = {"hum" : ''};
    var CO2  = {'co2' : ''};
    var soil = {'soil' : ''};
    res.locals.connection.query("select huminity from sensor_huminity order by id desc limit 1;"
    ,function(err, lstHum , fields){
        if(err){
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }else{
            hum["hum"] = lstHum;
            data['Data'].push(hum);
            res.locals.connection.query("select temperature from sensor_temperature order by id desc limit 1;"
            ,function(err, lstTmp, fields){
                if(err){
                    data["Data"] = err;
                    res.json(data);
                    res.locals.connection.end();
                }else{
                    temp["temp"] = lstTmp;
                    data['Data'].push(temp);
                    res.locals.connection.query("select carbon from sensor_carbon order by id desc limit 1;"
                    ,function(err, lstCO2, fields){
                        if(err){
                            data["Data"] = err;
                            res.json(data);
                            res.locals.connection.end();
                        }else{
                            CO2['co2'] = lstCO2
                            data['Data'].push(CO2);
                            res.locals.connection.query("select moisture from sensor_soil order by id desc limit 1;"
                            ,function(err, lstsoil, fields){
                                if(err){
                                    data["Data"] = err;
                                    res.json(data);
                                    res.locals.connection.end();
                                }else{
                                    soil['soil'] = lstsoil
                                    data['Data'].push(soil);
                                    res.json(data);
                                    res.locals.connection.end();
                                }
                            });
                        }
                    });
                }
            });
        }

    });
});

app.get('/getLastHum',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    res.locals.connection.query("select huminity from sensor_huminity order by id desc limit 1;"
    ,function(err, rows, fields){
        if(rows.length != 0){
            data["Data"] = rows;
            res.json(data);
            res.locals.connection.end();
        }else{
            data["Data"] = err;
            res.json(data);
            res.locals.connection.end();
        }
    });
});

app.post('/insert_temp',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    var sensor_module_id = req.body.sensor_module_id;
    var temperature = req.body.temperature;
    var dt = dateTime.create();
    var testtime = dt.format('Y-m-d H:M:S');
    console.log(testtime);
    dt.offsetInHours(7);
    var formatted = dt.format('Y-m-d H:M:S');
    console.log(formatted);
    res.locals.connection.query("SELECT * FROM farm_sensor WHERE sensor_module_id = ?;",[sensor_module_id]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            farm_id = rows[0].farm_id;       
            res.locals.connection.query("INSERT INTO sensor_temperature(farm_id,sensor_module_id,temperature,upd_date) values (?,?,?,?)",[farm_id,sensor_module_id,temperature,formatted]
                ,function(err, rows, fields){
                    if (err){
                        console.log(err);
                        data["Data"] = err;
                        res.json(data); 
                        res.locals.connection.end();
                    } else {
                        console.log(rows);
                        data["Data"] = rows;
                        res.json(data); 
                        res.locals.connection.end();
                    }
                });
        }
    });
});

app.post('/insert_hum',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    var sensor_module_id = req.body.sensor_module_id;
    var huminity = req.body.huminity;
    var dt = dateTime.create();
    var testtime = dt.format('Y-m-d H:M:S');
    console.log(testtime);
    dt.offsetInHours(7);
    var formatted = dt.format('Y-m-d H:M:S');
    console.log(formatted);
    res.locals.connection.query("SELECT * FROM farm_sensor WHERE sensor_module_id = ?;",[sensor_module_id]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            farm_id = rows[0].farm_id;       
            res.locals.connection.query("INSERT INTO sensor_huminity(farm_id,sensor_module_id,huminity,upd_date) values (?,?,?,?)",[farm_id,sensor_module_id,huminity,formatted]
                ,function(err, rows, fields){
                    if (err){
                        console.log(err);
                        data["Data"] = err;
                        res.json(data); 
                        res.locals.connection.end();
                    } else {
                        console.log(rows);
                        data["Data"] = rows;
                        res.json(data); 
                        res.locals.connection.end();
                    }
                });
        }
    });
});

app.post('/insert_soil',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    var sensor_module_id = req.body.sensor_module_id;
    var moisture = req.body.moisture;
    var dt = dateTime.create();
    var testtime = dt.format('Y-m-d H:M:S');
    console.log(testtime);
    dt.offsetInHours(7);
    var formatted = dt.format('Y-m-d H:M:S');
    console.log(formatted);
    res.locals.connection.query("SELECT * FROM farm_sensor WHERE sensor_module_id = ?;",[sensor_module_id]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            farm_id = rows[0].farm_id;       
            res.locals.connection.query("INSERT INTO sensor_soil(farm_id,sensor_module_id,moisture,upd_date) values (?,?,?,?)",[farm_id,sensor_module_id,moisture,formatted]
                ,function(err, rows, fields){
                    if (err){
                        console.log(err);
                        data["Data"] = err;
                        res.json(data); 
                        res.locals.connection.end();
                    } else {
                        console.log(rows);
                        data["Data"] = rows;
                        res.json(data); 
                        res.locals.connection.end();
                    }
                });
        }
    });
});

app.post('/insert_carbon',function(req,res){
    var data = {"Data":""};
    var farm_id = ''
    var sensor_module_id = req.body.sensor_module_id;
    var carbon = req.body.carbon;
    var dt = dateTime.create();
    var testtime = dt.format('Y-m-d H:M:S');
    console.log(testtime);
    dt.offsetInHours(7);
    var formatted = dt.format('Y-m-d H:M:S');
    console.log(formatted);
    res.locals.connection.query("SELECT * FROM farm_sensor WHERE sensor_module_id = ?;",[sensor_module_id]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            farm_id = rows[0].farm_id;       
            res.locals.connection.query("INSERT INTO sensor_carbon(farm_id,sensor_module_id,carbon,upd_date) values (?,?,?,?)",[farm_id,sensor_module_id,carbon,formatted]
                ,function(err, rows, fields){
                    if (err){
                        console.log(err);
                        data["Data"] = err;
                        res.json(data); 
                        res.locals.connection.end();
                    } else {
                        console.log(rows);
                        data["Data"] = rows;
                        res.json(data); 
                        res.locals.connection.end();
                    }
                });
        }
    });
});

app.post('/getcarbon_bydate',function(req,res){
    var data = {"Data":""};
    var date = req.body.date;
    var tmp_date = date + "%";
    res.locals.connection.query("SELECT * FROM sensor_carbon where upd_date like ?;",[tmp_date]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            data["Data"] = rows;
            res.json(data); 
            res.locals.connection.end();
        }
    });
});

app.post('/addsensor_node',function(req,res){
    var data = {"Data":""};
    var mac_id = req.body.mac_id;
    var sensor = req.body.sensor;
    res.locals.connection.query("INSERT INTO sensor_node(mac_id,sensor) values (?,?);",[mac_id,sensor]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
        }else {
            data["Data"] = rows;
            res.json(data); 
        }
        res.locals.connection.end();
    });
});

app.post('/addsensor_list',function(req,res){
    var data = {"Data":""};
    var sensor_id = req.body.sensor_id;
    var sensor_name = req.body.sensor_name;
    res.locals.connection.query("INSERT INTO sensor_list(sensor_id,sensor_name) values (?,?);",[sensor_id,sensor_name]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
        }else {
            data["Data"] = rows;
            res.json(data); 
        }
        res.locals.connection.end();
    });
});

app.post('/getalldata_bydate',function(req,res){
    var data = {"Data":[]};
    var temp = {"temp":''};
    var hum = {"hum" : ''};
    var CO2  = {'co2' : ''};
    var soil = {'soil' : ''};
    var date = req.body.date;
    var tmp_date = date + "%";
    res.locals.connection.query("SELECT * FROM sensor_carbon where upd_date like ?;",[tmp_date]
    ,function(err, dataCo2, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            CO2["co2"] = dataCo2;
            data["Data"].push(CO2);
            res.locals.connection.query("SELECT * FROM sensor_huminity where upd_date like ?;",[tmp_date]
            ,function(err, dataHum, fields){
                if (err) {
                    console.log(err);
                    data["Data"] = err;
                    res.json(data); 
                    res.locals.connection.end();
                }else {
                    hum["hum"] = dataHum;
                    data["Data"].push(hum);
                    res.locals.connection.query("SELECT * FROM sensor_soil where upd_date like ?;",[tmp_date]
                        ,function(err, dataSoil, fields){
                            if (err) {
                                console.log(err);
                                data["Data"] = err;
                                res.json(data); 
                                res.locals.connection.end();
                            }else {
                                soil["soil"] = dataSoil;
                                data["Data"].push(soil);
                                res.locals.connection.query("SELECT * FROM sensor_temperature where upd_date like ?;",[tmp_date]
                                    ,function(err, dataTemp, fields){
                                        if (err) {
                                            console.log(err);
                                            data["Data"] = err;
                                            res.json(data); 
                                            res.locals.connection.end();
                                        }else {
                                            temp["temp"] = dataTemp;
                                            data["Data"].push(temp);
                                            res.json(data); 
                                            res.locals.connection.end();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
        
            });
        });

// get all data bydate and farm_id
app.post('/getdata_bydate',function(req,res){
    var data = {"Data":[]};
    var temp = {"temp":''};
    var hum = {"hum" : ''};
    var CO2  = {'co2' : ''};
    var soil = {'soil' : ''};
    var date = req.body.date;
    var farm_id = req.body.farm_id;
    var tmp_date = date + "%";
    res.locals.connection.query("SELECT * FROM sensor_carbon where upd_date like ? and farm_id = ?;",[tmp_date,farm_id]
    ,function(err, dataCo2, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
            res.locals.connection.end();
        }else {
            CO2["co2"] = dataCo2;
            data["Data"].push(CO2);
            res.locals.connection.query("SELECT * FROM sensor_huminity where upd_date like ? and farm_id = ?;",[tmp_date,farm_id]
            ,function(err, dataHum, fields){
                if (err) {
                    console.log(err);
                    data["Data"] = err;
                    res.json(data); 
                    res.locals.connection.end();
                }else {
                    hum["hum"] = dataHum;
                    data["Data"].push(hum);
                    res.locals.connection.query("SELECT * FROM sensor_soil where upd_date like ? and farm_id = ?;",[tmp_date,farm_id]
                        ,function(err, dataSoil, fields){
                            if (err) {
                                console.log(err);
                                data["Data"] = err;
                                res.json(data); 
                                res.locals.connection.end();
                            }else {
                                soil["soil"] = dataSoil;
                                data["Data"].push(soil);
                                res.locals.connection.query("SELECT * FROM sensor_temperature where upd_date like ? and farm_id = ?;",[tmp_date,farm_id]
                                    ,function(err, dataTemp, fields){
                                        if (err) {
                                            console.log(err);
                                            data["Data"] = err;
                                            res.json(data); 
                                            res.locals.connection.end();
                                        }else {
                                            temp["temp"] = dataTemp;
                                            data["Data"].push(temp);
                                            res.json(data); 
                                            res.locals.connection.end();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
        
            });
        });

// list all module in farm 
app.post('/getallsensor_node_infarm',function(req,res){
    var data = {"Data":""};
    var farm_id = req.body.farm_id;
    res.locals.connection.query("SELECT * FROM farm_sensor where farm_id = ?;",[farm_id]
    ,function(err, rows, fields){
        if (err) {
            console.log(err);
            data["Data"] = err;
            res.json(data); 
        }else {
            data["Data"] = rows;
            var length = data["Data"].length;
            data["length"] = length;
            res.json(data); 
        }
        res.locals.connection.end();
    });
});


app.get('/getlastallsensor',function(req,res){
    var data = {"Data":[]};
    var temp = {"temp":''};
    var hum = {"hum" : ''};
    var CO2  = {'co2' : ''};
    var soil = {'soil' : ''};
    // query hum
    res.locals.connection.query("select huminity , sensor_module_id from sensor_huminity order by id desc limit 1;"
    ,function(err, humVal, fields){
        if(err){
            hum["hum"] = err;
            res.json(data);
        }else{
            hum["hum"] = humVal;
            data["Data"].push(hum);
            // query temp
            res.locals.connection.query("select temperature , sensor_module_id from sensor_temperature order by id desc limit 1;"
            ,function(err, tempVal, fields){
                if(err){
                    temp["temp"] = err;
                    res.json(data);
                }else{
                    temp["temp"] = tempVal;
                    data["Data"].push(temp);
                    // query co2
                    res.locals.connection.query("select carbon , sensor_module_id from sensor_carbon order by id desc limit 1;"
                    ,function(err, co2Val, fields){
                        if(err){
                            CO2["co2"] = err;
                            res.json(data);
                        }else{
                            CO2["co2"] = co2Val;
                            data["Data"].push(CO2);
                                // query soil
                            res.locals.connection.query("select moisture , sensor_module_id from sensor_soil order by id desc limit 1;"
                            ,function(err, soilVal, fields){
                                if(err){
                                    soil["soil"] = err;
                                    res.json(data);
                                }else{
                                    soil["soil"] = soilVal;
                                    data["Data"].push(soil);
                                    res.json(data);
                                    res.locals.connection.end();
                                }
                            });
                        }
                    });
                }
            });

        }
    });
});
// get all value sensor 
app.post('/getcurrent_values',function(req,res){
    var data = {"Data":[]};
    var temp = {"temp":''};
    var hum = {"hum" : ''};
    var CO2  = {'co2' : ''};
    var soil = {'soil' : ''};
    var farm_id = req.body.farm_id;
    // query hum
    res.locals.connection.query("select huminity , sensor_module_id from sensor_huminity where farm_id = ? order by id desc limit 1;",[farm_id]
    ,function(err, humVal, fields){
        if(err){
            hum["hum"] = err;
            res.json(data);
        }else{
            hum["hum"] = humVal;
            data["Data"].push(hum);
            // query temp
            res.locals.connection.query("select temperature , sensor_module_id from sensor_temperature where farm_id = ? order by id desc limit 1;",[farm_id]
            ,function(err, tempVal, fields){
                if(err){
                    temp["temp"] = err;
                    res.json(data);
                }else{
                    temp["temp"] = tempVal;
                    data["Data"].push(temp);
                    // query co2
                    res.locals.connection.query("select carbon , sensor_module_id from sensor_carbon where farm_id = ? order by id desc limit 1;",[farm_id]
                    ,function(err, co2Val, fields){
                        if(err){
                            CO2["co2"] = err;
                            res.json(data);
                        }else{
                            CO2["co2"] = co2Val;
                            data["Data"].push(CO2);
                                // query soil
                            res.locals.connection.query("select moisture , sensor_module_id from sensor_soil where farm_id = ? order by id desc limit 1;",[farm_id]
                            ,function(err, soilVal, fields){
                                if(err){
                                    soil["soil"] = err;
                                    res.json(data);
                                }else{
                                    soil["soil"] = soilVal;
                                    data["Data"].push(soil);
                                    res.json(data);
                                    res.locals.connection.end();
                                }
                            });
                        }
                    });
                }
            });

        }
    });
});


app.get('/getstatuscontroller',function(req,res){
    var data = {"Data":""};
    res.locals.connection.query("select * from status_controller;"
                            ,function(err, value, fields){
                                if(err){
                                    data["Data"] = err;
                                    res.json(data);
                                }else{
                                    data["Data"]= value
                                    res.json(data);
                                }
                                res.locals.connection.end();
                            });
});
        

// MQTT api

app.post('/mqtt',function(req,res){
    var cur_status = {"cur_status" : ""}
    var strStatus;
    var cmd = req.body.cmd;
    var value = req.body.value;
    var options = {
        port: 10591,
        host: 'mqtt://m16.cloudmqtt.com',
        username: 'alyaekia',
        password: 'D6yHwEp_4FNo'
    };
    var client  = mqtt.connect('mqtt://m16.cloudmqtt.com' , options) 
    client.on('connect', function () {
        client.subscribe('presence', function (err) {
        if (!err) {
            client.publish("control/"+cmd, value)
            console.log("connect to mqtt with : " , cmd + " : " + value);
            client.end()
        }
        else {
            client.end()
            console.log("error can't connect to mqtt server")
            res.json({"status" : "error can't connect to mqtt server"})
        }
        });
    })

    var pos_0 = value.search("0");
    var pos_1 = value.search("1");

    res.locals.connection.query("select * from status_controller where control = ?;",[cmd]
                            ,function(err, value, fields){
                                if(err){
                                    cur_status["cur_status"] = err;
                                }else{
                                    cur_status["cur_status"] = value;
                                }
                            
                                //jsonStatus = JSON.parse(cur_status);
                                var tmp = cur_status["cur_status"]
                                strStatus = tmp[0].status;
                                if (pos_0 >= 0) {
                                    strStatus = strStatus.substr(0, pos_0) + '0' + strStatus.substr(pos_0 + 1);
                                }else if (pos_1 >= 0) {
                                    strStatus = strStatus.substr(0, pos_1) + '1' + strStatus.substr(pos_1 + 1);
                                } 
                                console.log(strStatus)
                                res.locals.connection.query("UPDATE status_controller SET status = ? WHERE control = ?;",[strStatus,cmd]
                                ,function(err, soilVal, fields){
                                    if(err){
                                        res.json({"status" : "fail to update"})
                                    }else{
                                        res.json({"status" : "successfully"})
                                        
                                    }
                                    res.locals.connection.end();
                                });  
                            });
    // client.on('message', function (topic, message) {
    //     // message is Buffer
    //     console.log(topic.toString())
    //     console.log(message.toString())
    //     client.end()
    // })
});

app.post('/mqttallled',function(req,res){
    var strStatus;
    var cmd = req.body.cmd;
    var value = req.body.value;
    var options = {
        port: 10591,
        host: 'mqtt://m16.cloudmqtt.com',
        username: 'alyaekia',
        password: 'D6yHwEp_4FNo'
    };
    var client  = mqtt.connect('mqtt://m16.cloudmqtt.com' , options) 
    client.on('connect', function () {
        client.subscribe('presence', function (err) {
        if (!err) {
            client.publish("control/"+cmd, value)
            console.log("connect to mqtt with : " , cmd + " : " + value);
            client.end()
        }
        else {
            client.end()
            console.log("error can't connect to mqtt server")
            res.json({"status" : "error can't connect to mqtt server"})
        }
        });
    })
    res.locals.connection.query("UPDATE status_controller SET status = ? WHERE control = ?;",[value,cmd]
    ,function(err, soilVal, fields){
        if(err){
            res.json({"status" : "fail to update"})
        }else{
            res.json({"status" : "successfully"})
        }
        res.locals.connection.end();
    });  
    // client.on('message', function (topic, message) {
    //     // message is Buffer
    //     console.log(topic.toString())
    //     console.log(message.toString())
    //     client.end()
    // })
});

app.post('/mqttair',function(req,res){
    var cmd = req.body.cmd;
    var value = req.body.value;
    var options = {
        port: 10591,
        host: 'mqtt://m16.cloudmqtt.com',
        username: 'alyaekia',
        password: 'D6yHwEp_4FNo'
    };
    var client  = mqtt.connect('mqtt://m16.cloudmqtt.com' , options) 
    client.on('connect', function () {
        client.subscribe('presence', function (err) {
        if (!err) {
            client.publish("control/"+cmd  , value)
            console.log("connect to mqtt with : " , cmd + " : " + value);
            client.end()
        }
        else {
            client.end()
            console.log("error can't connect to mqtt server")
            res.json({"status" : "error can't connect to mqtt server"})
        }
        });
    })
    res.locals.connection.query("UPDATE status_controller SET status = ? WHERE control = ?;",[value,cmd]
    ,function(err, soilVal, fields){
        if(err){
            res.json({"status" : "fail to update"})
        }else{
            res.json({"status" : "successfully"})
        }
        res.locals.connection.end();
    });  
    // client.on('message', function (topic, message) {
    //     // message is Buffer
    //     console.log(topic.toString())
    //     console.log(message.toString())
    //     client.end()
    // })
});

app.post('/testMqtt',function(req,res){
    var options = {
        port: 10591,
        host: 'mqtt://m16.cloudmqtt.com',
        username: 'alyaekia',
        password: 'D6yHwEp_4FNo'
    };
    
    var tools = "control/led"
    var cmd = "1111111"
    
    var client  = mqtt.connect('mqtt://m16.cloudmqtt.com' , options)
     
    client.on('connect', function () {
      client.subscribe('presence', function (err) {
        if (!err) {
          client.publish(tools, cmd)
          console.log('connected')
          client.end()
        }
      })
    })
     
    client.on('message', function (topic, message) {
      // message is Buffer
      console.log(message.toString())
      client.end()
    })
    res.json("{'res' : 'end'}")
})

app.listen(port, function() {
    console.log('Starting Smartfarm database on port ' + port);
});