const express = require("express");
const router = express.Router();
var mongodb = require('../../function/mongodb');
var mongodbINS = require('../../function/mongodbINS');
var mssql = require('../../function/mssql');
var request = require('request');
const axios = require("../../function/axios");

//----------------- date

const d = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });;
let day = d;

//----------------- SETUP

let NAME_INS = 'APP-GASHES'

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';
let UNIT = 'UNIT';

//----------------- dynamic

let finddbbuffer = [{}];

let APPGASHESdb = {
  "INS": NAME_INS,
  "PO": "",
  "CP": "",
  "MATCP": "",
  "QTY": "",
  "PROCESS": "",
  "CUSLOT": "",
  "TPKLOT": "",
  "FG": "",
  "CUSTOMER": "",
  "PART": "",
  "PARTNAME": "",
  "MATERIAL": "",
  //---new
  "QUANTITY": '',
  // "PROCESS": '',
  "CUSLOTNO": '',
  "FG_CHARG": '',
  "PARTNAME_PO": '',
  "PART_PO": '',
  "CUSTNAME": '',
  //-------
  "ItemPick": [],
  "ItemPickcode": [],
  "POINTs": "",
  "PCS": "",
  "PCSleft": "",
  "UNIT": "",
  "INTERSEC": "",
  "RESULTFORMAT": "",
  "GRAPHTYPE": "",
  "GAP": "",
  //---------
  "preview": [],
  "confirmdata": [],
  "ITEMleftUNIT": [],
  "ITEMleftVALUE": [],
  //
  "MeasurmentFOR": "FINAL",
  "inspectionItem": "", //ITEMpice
  "inspectionItemNAME": "",
  "tool": NAME_INS,
  "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
  "dateupdatevalue": day,
  //
  "PIC": "",
}

router.get('/CHECK-APPGASHES', async (req, res) => {

  return res.json(APPGASHESdb['PO']);
});


router.post('/APPGASHESdb', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHESdb--');
  // console.log(req.body);
  //-------------------------------------
  let finddb = [{}];
  try {

    finddb = APPGASHESdb;
    finddbbuffer = finddb;
  }
  catch (err) {
    finddb = finddbbuffer;
  }
  //-------------------------------------
  return res.json(finddb);
});

router.post('/GETINtoAPPGASHES', async (req, res) => {
  //-------------------------------------
  console.log('--GETINtoAPPGASHES--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  check = APPGASHESdb;
  if (input['PO'] !== undefined && input['CP'] !== undefined && check['PO'] === '') {
    // let dbsap = await mssql.qurey(`select * FROM [SAPData_HES_ISN].[dbo].[tblSAPDetail] where [PO] = ${input['PO']}`);
    let findPO = await mongodb.findSAP('mongodb://172.23.10.73:27017', "ORDER", "ORDER", {});

    let cuslot = '';

    if (findPO[0][`DATA`] != undefined && findPO[0][`DATA`].length > 0) {
      let dbsap = ''
      for (i = 0; i < findPO[0][`DATA`].length; i++) {
        if (findPO[0][`DATA`][i][`PO`] === input['PO']) {
          dbsap = findPO[0][`DATA`][i];
          // break;
          cuslot = cuslot+ findPO[0][`DATA`][i][`CUSLOTNO`]+ ','
        }
      }


      if (dbsap !== '') {

        let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
        let masterITEMs = await mongodb.find(master_FN, ITEMs, {});
        let MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

        let ItemPickout = [];
        let ItemPickcodeout = [];

        for (i = 0; i < findcp[0]['FINAL'].length; i++) {
          for (j = 0; j < masterITEMs.length; j++) {
            if (findcp[0]['FINAL'][i]['ITEMs'] === masterITEMs[j]['masterID']) {
              ItemPickout.push(masterITEMs[j]['ITEMs']);
              ItemPickcodeout.push({ "key": masterITEMs[j]['masterID'], "value": masterITEMs[j]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] });
            }
          }
        }

        let ItemPickoutP2 = []
        let ItemPickcodeoutP2 = [];
        for (i = 0; i < ItemPickcodeout.length; i++) {
          for (j = 0; j < MACHINEmaster.length; j++) {
            if (ItemPickcodeout[i]['METHOD'] === MACHINEmaster[j]['masterID']) {
              if (MACHINEmaster[j]['MACHINE'].includes(NAME_INS)) {
                ItemPickoutP2.push(ItemPickout[i]);
                ItemPickcodeoutP2.push(ItemPickcodeout[i]);
              }
            }
          }
        }
        var picS = "";
        // console.log(findcp[0]['Pimg'])
        if(findcp.length >0){
          if(findcp[0]['Pimg'] !== undefined ){
            picS = `${findcp[0]['Pimg'][`P1`]}`
          }
          
        }

        APPGASHESdb = {
          "INS": NAME_INS,
          "PO": input['PO'] || '',
          "CP": input['CP'] || '',
          "MATCP": input['CP'] || '',
          "QTY": dbsap['QUANTITY'] || '',
          "PROCESS": dbsap['PROCESS'] || '',
          // "CUSLOT": dbsap['CUSLOTNO'] || '',
          "CUSLOT": cuslot,
          "TPKLOT": dbsap['FG_CHARG'] || '',
          "FG": dbsap['FG'] || '',
          "CUSTOMER": dbsap['CUSTOMER'] || '',
          "PART": findcp[0]['PART'] || '',
          "PART_s": dbsap['PART'] || '',
          "PARTNAME_s": dbsap['PARTNAME'] || '',
          "PARTNAME": findcp[0]['PARTNAME'] || '',
          // "MATERIAL": findcp[0]['MATERIAL'] || '',
          // "MATERIAL_s": dbsap['MATERIAL'] || '',
          "MATERIAL": dbsap['MATERIAL'] || '', 
          "MATERIAL_s": findcp[0]['MATERIAL'] || '',
          //---new
          "QUANTITY": dbsap['QUANTITY'] || '',
          // "PROCESS":dbsap ['PROCESS'] || '',
          // "CUSLOTNO": dbsap['CUSLOTNO'] || '',
          "CUSLOTNO":  cuslot,
          "FG_CHARG": dbsap['FG_CHARG'] || '',
          "PARTNAME_PO": dbsap['PARTNAME_PO'] || '',
          "PART_PO": dbsap['PART_PO'] || '',
          "CUSTNAME_s": dbsap['CUSTNAME'] || '',
          "CUSTNAME": dbsap['CUST_FULLNM']|| '',
          "UNITSAP": dbsap['UNIT'] || '',
          //----------------------
          "ItemPick": ItemPickoutP2, //---->
          "ItemPickcode": ItemPickcodeoutP2, //---->
          "POINTs": "",
          "PCS": "",
          "PCSleft": "",
          "UNIT": "",
          "INTERSEC": "",
          "RESULTFORMAT": "",
          "GRAPHTYPE": "",
          "GAP": "",
          //----------------------
          "preview": [],
          "confirmdata": [],
          "ITEMleftUNIT": [],
          "ITEMleftVALUE": [],
          //
          "MeasurmentFOR": "FINAL",
          "inspectionItem": "", //ITEMpice
          "inspectionItemNAME": "",
          "tool": NAME_INS,
          "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
          "dateupdatevalue": day,
          //
          "PIC": picS,
        }

        output = 'OK';


      } else {
        output = 'NOK';
      }

    } else {
      output = 'NOK';
    }

  } else {
    output = 'NOK';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/APPGASHES-geteachITEM', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHES-geteachITEM--');
  console.log(req.body);
  let inputB = req.body;

  let ITEMSS = '';
  let output = 'NOK';

  for (i = 0; i < APPGASHESdb['ItemPickcode'].length; i++) {
    if (APPGASHESdb['ItemPickcode'][i]['value'] === inputB['ITEMs']) {
      ITEMSS = APPGASHESdb['ItemPickcode'][i]['key'];
    }
  }


  if (ITEMSS !== '') {

    //-------------------------------------
    APPGASHESdb['inspectionItem'] = ITEMSS;
    APPGASHESdb['inspectionItemNAME'] = inputB['ITEMs'];
    let input = { 'PO': APPGASHESdb["PO"], 'CP': APPGASHESdb["CP"], 'ITEMs': APPGASHESdb['inspectionItem'] };
    //-------------------------------------
    if (input['PO'] !== undefined && input['CP'] !== undefined && input['ITEMs'] !== undefined) {
      let findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
      let UNITdata = await mongodb.find(master_FN, UNIT, {});
      let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": APPGASHESdb['inspectionItem'] });

      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        if (findcp[0]['FINAL'][i]['ITEMs'] === input['ITEMs']) {

          // output = [{
          //   "RESULTFORMAT": findcp[0]['FINAL'][i]['RESULTFORMAT'],
          //   "GRAPHTYPE": findcp[0]['FINAL'][i]['GRAPHTYPE'],
          //   "INTERSECTION": findcp[0]['FINAL'][i]['INTERSECTION'],
          //   "DOCUMENT": findcp[0]['FINAL'][i]['DOCUMENT'],
          //   "SPECIFICATION": findcp[0]['FINAL'][i]['SPECIFICATION'],
          //   "POINTPCS": findcp[0]['FINAL'][i]['POINTPCS'],
          //   "POINT": findcp[0]['FINAL'][i]['POINT'],
          //   "PCS": findcp[0]['FINAL'][i]['PCS'],
          //   "FREQUENCY": findcp[0]['FINAL'][i]['FREQUENCY'],
          //   "MODE": findcp[0]['FINAL'][i]['MODE'],
          //   "REMARK": findcp[0]['FINAL'][i]['REMARK'],
          //   "LOAD": findcp[0]['FINAL'][i]['LOAD'],
          //   "CONVERSE": findcp[0]['FINAL'][i]['CONVERSE'],
          // }]

          if (masterITEMs.length > 0) {
            //
            APPGASHESdb["RESULTFORMAT"] = masterITEMs[0]['RESULTFORMAT']
            APPGASHESdb["GRAPHTYPE"] = masterITEMs[0]['GRAPHTYPE']
          }

          for (j = 0; j < UNITdata.length; j++) {
            if (findcp[0]['FINAL'][i]['UNIT'] == UNITdata[j]['masterID']) {
              APPGASHESdb["UNIT"] = UNITdata[j]['UNIT'];
            }
          }

          APPGASHESdb["POINTs"] = findcp[0]['FINAL'][i]['POINT'];
          APPGASHESdb["PCS"] = findcp[0]['FINAL'][i]['PCS'];


          APPGASHESdb["PCSleft"] = findcp[0]['FINAL'][i]['PCS'];



          APPGASHESdb["INTERSEC"] = "";
          output = 'OK';
          let findpo = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
          if (findpo.length > 0) {
            request.post(
              'http://127.0.0.1:16020/APPGASHES-feedback',
              { json: { "PO": APPGASHESdb['PO'], "ITEMs": APPGASHESdb['inspectionItem'] } },
              function (error, response, body2) {
                if (!error && response.statusCode == 200) {
                  // console.log(body2);
                  if (body2 === 'OK') {
                    // output = 'OK';
                  }
                }
              }
            );
          }
          break;
        }
      }
    }

  } else {
    APPGASHESdb["POINTs"] = '',
      APPGASHESdb["PCS"] = '',
      APPGASHESdb["PCSleft"] = '',
      APPGASHESdb["UNIT"] = "",
      APPGASHESdb["INTERSEC"] = "",
      output = 'NOK';
  }

  //-------------------------------------
  return res.json(output);
});

router.post('/APPGASHES-preview', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHES-preview--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input.length > 0) {
    if (input[0]['V1'] !== undefined) {
      //-------------------------------------
      try {
        APPGASHESdb['preview'] = input;
        output = 'OK';
      }
      catch (err) {
        output = 'NOK';
      }
      //-------------------------------------
    } else {
      output = 'NOK';
    }
  } else {
    APPGASHESdb['preview'] = [];
    output = 'clear';
  }


  //-------------------------------------
  return res.json(output);
});

router.post('/APPGASHES-confirmdata', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHES-confirmdata--');
  console.log(req.body);
  // let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {
    let datapush = APPGASHESdb['preview'][0]

    if (APPGASHESdb['RESULTFORMAT'] === 'Graph') {

    } else if (APPGASHESdb['RESULTFORMAT'] === 'Number') {

      let pushdata = APPGASHESdb['preview'][0]

      pushdata['V5'] = APPGASHESdb['confirmdata'].length + 1
      pushdata['V1'] = `${APPGASHESdb['confirmdata'].length + 1}:${pushdata['V1']}`

      APPGASHESdb['confirmdata'].push(pushdata);
      APPGASHESdb['preview'] = [];
      output = 'OK';
    }
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});



router.post('/APPGASHES-feedback', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHES-feedback--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  //-------------------------------------
  if (input["PO"] !== undefined && input["ITEMs"] !== undefined) {
    let feedback = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
    if (feedback.length > 0 && feedback[0]['FINAL'] != undefined && feedback[0]['FINAL'][NAME_INS] != undefined && feedback[0]['FINAL'][NAME_INS][input["ITEMs"]] != undefined) {
      // console.log(Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]));
      let oblist = Object.keys(feedback[0]['FINAL'][NAME_INS][input["ITEMs"]]);
      let ob = feedback[0]['FINAL'][NAME_INS][input["ITEMs"]];


      let LISTbuffer = [];
      let ITEMleftVALUEout = [];

      if (ob[0] !== undefined) {
        for (i = 0; i < oblist.length; i++) {
          LISTbuffer.push(...ob[oblist[i]])
        }
      } else {
        for (i = 0; i < oblist.length; i++) {
          LISTbuffer.push(ob[oblist[i]])
        }
      }


      APPGASHESdb["PCSleft"] = `${parseInt(APPGASHESdb["PCS"]) - oblist.length}`;
      if (APPGASHESdb['RESULTFORMAT'] === 'Number') {
        for (i = 0; i < LISTbuffer.length; i++) {
          if (LISTbuffer[i]['PO1'] === 'Mean') {
            ITEMleftVALUEout.push({ "V1": 'Mean', "V2": `${LISTbuffer[i]['PO3']}` })
          } else {
            ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO2']}`, "V2": `${LISTbuffer[i]['PO3']}` })
          }

        }

        APPGASHESdb["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        APPGASHESdb["ITEMleftVALUE"] = ITEMleftVALUEout;

      } else if (APPGASHESdb['RESULTFORMAT'] === 'Text') { //add

        for (i = 0; i < LISTbuffer.length; i++) {
          ITEMleftVALUEout.push({ "V1": `${LISTbuffer[i]['PO1']}`, "V2": `${LISTbuffer[i]['PO2']}` })
        }

        APPGASHESdb["ITEMleftUNIT"] = [{ "V1": "FINAL", "V2": `${oblist.length}` }];
        APPGASHESdb["ITEMleftVALUE"] = ITEMleftVALUEout;

      }
      // output = 'OK';
      if ((parseInt(APPGASHESdb["PCS"]) - oblist.length) == 0) {
        //CHECKlist
        for (i = 0; i < feedback[0]['CHECKlist'].length; i++) {
          if (input["ITEMs"] === feedback[0]['CHECKlist'][i]['key']) {
            feedback[0]['CHECKlist'][i]['FINISH'] = 'OK';
            feedback[0]['CHECKlist'][i]['timestamp'] = `${Date.now()}`;
            // console.log(feedback[0]['CHECKlist']);
            let feedbackupdate = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'CHECKlist': feedback[0]['CHECKlist'] } });
            break;
          }
        }
        //input["ITEMs"] 
        let masterITEMs = await mongodb.find(master_FN, ITEMs, { "masterID": input["ITEMs"] });


        if (feedback[0]['FINAL_ANS'] === undefined) {
          feedback[0]['FINAL_ANS'] = {}
        }
        if (masterITEMs.length > 0) {
          let anslist = [];
          let anslist_con = [];


          if (masterITEMs[0]['RESULTFORMAT'] === 'Number') {
            for (i = 0; i < LISTbuffer.length; i++) {
              if (LISTbuffer[i]['PO1'] === 'Mean') {
                anslist.push(LISTbuffer[i]['PO3'])
                anslist_con.push(LISTbuffer[i]['PO5'])
              }
            }

            let sum1 = anslist.reduce((a, b) => a + b, 0);
            let avg1 = (sum1 / anslist.length) || 0;
            let sum2 = anslist_con.reduce((a, b) => a + b, 0);
            let avg2 = (sum2 / anslist_con.length) || 0;

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = avg1;
            feedback[0]['FINAL_ANS'][`${input["ITEMs"]}_c`] = avg2;

            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Text') {

            feedback[0]['FINAL_ANS'][input["ITEMs"]] = LISTbuffer[0]['PO2'];
            let feedbackupdateRESULTFORMAT = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { 'FINAL_ANS': feedback[0]['FINAL_ANS'] } });


          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Graph') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'Picture') {

          } else if (masterITEMs[0]['RESULTFORMAT'] === 'OCR') {

          } else {

          }
        }

      }
    } else {
      APPGASHESdb["ITEMleftUNIT"] = '';
      APPGASHESdb["ITEMleftVALUE"] = '';
    }

  }

  //-------------------------------------
  return res.json(output);
});

router.post('/APPGASHES-SETZERO', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHESfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    APPGASHESdb = {
      "INS": NAME_INS,
      "PO": "",
      "CP": "",
      "MATCP": "",
      "QTY": "",
      "PROCESS": "",
      "CUSLOT": "",
      "TPKLOT": "",
      "FG": "",
      "CUSTOMER": "",
      "POINTs": "",
      "PART": "",
      "PARTNAME": "",
      "MATERIAL": "",
      //---new
      "QUANTITY": '',
      // "PROCESS": '',
      "CUSLOTNO": '',
      "FG_CHARG": '',
      "PARTNAME_PO": '',
      "PART_PO": '',
      "CUSTNAME": '',
      //-----
      "ItemPick": [],
      "ItemPickcode": [],
      "PCS": "",
      "PCSleft": "",
      "UNIT": "",
      "INTERSEC": "",
      "RESULTFORMAT": "",
      "GRAPHTYPE": "",
      "GAP": "",
      //---------
      "preview": [],
      "confirmdata": [],
      "ITEMleftUNIT": [],
      "ITEMleftVALUE": [],
      //
      "MeasurmentFOR": "FINAL",
      "inspectionItem": "", //ITEMpice
      "inspectionItemNAME": "",
      "tool": NAME_INS,
      "value": [],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN
      "dateupdatevalue": day,
      //
      "PIC": "",
    }
    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/APPGASHES-CLEAR', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHESfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    APPGASHESdb['preview'] = [];
    APPGASHESdb['confirmdata'] = [];

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

router.post('/APPGASHES-RESETVALUE', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHESfromINS--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';
  //-------------------------------------
  try {

    let all = APPGASHESdb['confirmdata'].length
    if (all > 0) {
      APPGASHESdb['confirmdata'].pop();
    }

    output = 'OK';
  }
  catch (err) {
    output = 'NOK';
  }
  //-------------------------------------
  return res.json(output);
});

//"value":[],  //key: PO1: itemname ,PO2:V01,PO3: V02,PO4: V03,PO5:V04,P06:INS,P9:NO.,P10:TYPE, last alway mean P01:"MEAN",PO2:V01,PO3:V02-MEAN,PO4: V03,PO5:V04-MEAN


router.post('/APPGASHES-FINISH', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHES-FINISH--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  if (APPGASHESdb['RESULTFORMAT'] === 'Number' || APPGASHESdb['RESULTFORMAT'] === 'Text') {

    APPGASHESdb["value"] = [];
    for (i = 0; i < APPGASHESdb['confirmdata'].length; i++) {
      APPGASHESdb["value"].push({
        "PO1": APPGASHESdb["inspectionItemNAME"],
        "PO2": APPGASHESdb['confirmdata'][i]['V1'],
        "PO3": APPGASHESdb['confirmdata'][i]['V2'],
        "PO4": APPGASHESdb['confirmdata'][i]['V3'],
        "PO5": APPGASHESdb['confirmdata'][i]['V4'],
        "PO6": "-",
        "PO7": "-",
        "PO8": "-",
        "PO9": i + 1,
        "PO10": "AUTO",
      });
    }
    if (APPGASHESdb["value"].length > 0) {
      let mean01 = [];
      let mean02 = [];
      for (i = 0; i < APPGASHESdb["value"].length; i++) {
        mean01.push(parseFloat(APPGASHESdb["value"][i]["PO3"]));
        mean02.push(parseFloat(APPGASHESdb["value"][i]["PO5"]));
      }
      let sum1 = mean01.reduce((a, b) => a + b, 0);
      let avg1 = (sum1 / mean01.length) || 0;
      let sum2 = mean02.reduce((a, b) => a + b, 0);
      let avg2 = (sum2 / mean02.length) || 0;
      APPGASHESdb["value"].push({
        "PO1": 'Mean',
        "PO2": APPGASHESdb['confirmdata'][0]['V1'],
        "PO3": avg1,
        "PO4": APPGASHESdb['confirmdata'][0]['V3'],
        "PO5": avg2,
      });
    }

  } else if (APPGASHESdb['RESULTFORMAT'] === 'OCR' || APPGASHESdb['RESULTFORMAT'] === 'Picture') {

  } else if (APPGASHESdb['RESULTFORMAT'] === 'Graph') {

  }

  if (APPGASHESdb['RESULTFORMAT'] === 'Number' ||
    APPGASHESdb['RESULTFORMAT'] === 'Text' ||
    APPGASHESdb['RESULTFORMAT'] === 'OCR' ||
    APPGASHESdb['RESULTFORMAT'] === 'Picture') {
    request.post(
      'http://127.0.0.1:16020/FINISHtoDB',
      { json: APPGASHESdb },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          APPGASHESdb['confirmdata'] = [];
          APPGASHESdb["value"] = [];
          //------------------------------------------------------------------------------------

          request.post(
            'http://127.0.0.1:16020/APPGASHES-feedback',
            { json: { "PO": APPGASHESdb['PO'], "ITEMs": APPGASHESdb['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );

          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }

  //-------------------------------------
  return res.json(APPGASHESdb);
});


router.post('/APPGASHES-FINISH-APR', async (req, res) => {
  //-------------------------------------
  console.log('--APPGASHES-FINISH-APR--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'OK';

  // for (i = 0; i < parseInt(APPGASHESdb['PCS']); i++) {

  if (APPGASHESdb['RESULTFORMAT'] === 'Text' && input["APRitem"] !== undefined && input["APRre"] !== undefined) {

    APPGASHESdb["value"] = {
      "PO1": input["APRitem"],
      "PO2": input["APRre"],
      "PO3": "-",
      "PO4": "-",
      "PO5": "-",
      "PO6": "-",
      "PO7": "-",
      "PO8": "-",
      "PO9": 1,
      "PO10": "AUTO",
    };


  }

  if (APPGASHESdb['RESULTFORMAT'] === 'Text') {
    request.post(
      'http://127.0.0.1:16020/FINISHtoDB-apr',
      { json: APPGASHESdb },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // console.log(body);
          // if (body === 'OK') {
          APPGASHESdb['confirmdata'] = [];
          APPGASHESdb["value"] = [];
          //------------------------------------------------------------------------------------
          request.post(
            'http://127.0.0.1:16020/APPGASHES-feedback',
            { json: { "PO": APPGASHESdb['PO'], "ITEMs": APPGASHESdb['inspectionItem'] } },
            function (error, response, body2) {
              if (!error && response.statusCode == 200) {
                // console.log(body2);
                // if (body2 === 'OK') {
                output = 'OK';
                // }
              }
            }
          );
          //------------------------------------------------------------------------------------
          // }

        }
      }
    );

  }
  // }


  //-------------------------------------
  return res.json(output);
});


module.exports = router;


