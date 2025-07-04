const express = require("express");
const { kill } = require("nodemon/lib/monitor/run");
const router = express.Router();
let mongodb = require('../../function/mongodb');

//----------------- DATABASE

let MAIN_DATA = 'MAIN_DATA';
let MAIN = 'MAIN';

let PATTERN = 'PATTERN';
let PATTERN_01 = 'PATTERN_01';
let master_FN = 'master_FN';
let ITEMs = 'ITEMs';
let METHOD = 'METHOD';
let MACHINE = 'MACHINE';

router.post('/getmaster', async (req, res) => {
  //-------------------------------------
  console.log('--getmaster--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = 'NOK';

  if (input['PO'] !== undefined && input['CP'] !== undefined) {

  }


  //-------------------------------------
  return  res.json(output);
});

router.post('/GETINSset', async (req, res) => {
  //-------------------------------------
  console.log('--GETINSset--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = {};
  let findcp = [];
  let findPO = [];
  let ITEMMETHODlist = [];
  let METHODmaster = [];
  let MACHINEmaster = [];
  let INSLIST = [];
  let INSLISTans = [];


  if (input['CP'] !== undefined && input['PO'] !== undefined) {
    findcp = await mongodb.find(PATTERN, PATTERN_01, { "CP": input['CP'] });
    findPO = await mongodb.find(MAIN_DATA, MAIN, { "PO": input['PO'] });
  }
  if (findcp.length > 0 && findPO.length === 0) {
    if (findcp[0]['FINAL'] !== undefined && findcp[0]['FINAL'].length > 0) {
      for (i = 0; i < findcp[0]['FINAL'].length; i++) {
        ITEMMETHODlist.push({ "ITEMs": findcp[0]['FINAL'][i]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] })
      }

      METHODmaster = await mongodb.find(master_FN, METHOD, {});
      MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

      for (i = 0; i < ITEMMETHODlist.length; i++) {
        for (j = 0; j < METHODmaster.length; j++) {
          if (ITEMMETHODlist[i]['METHOD'] === METHODmaster[j]['METHOD']) {
            for (k = 0; k < MACHINEmaster.length; k++) {
              if (METHODmaster[j]['METHOD'] === MACHINEmaster[k]['masterID']) {
                if (MACHINEmaster[k]['MACHINE'].length > 0) {
                  INSLIST.push(...MACHINEmaster[k]['MACHINE']);
                }
              }
            }
          }
        }
      }
      INSLISTans = [...new Set(INSLIST)];
    }
  } else {
    try {

      let CHECKlist = findPO[0]['CHECKlist'];
      let CHECKlistnew = [];
      MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

      for (i = 0; i < CHECKlist.length; i++) {
        if (CHECKlist[i]['FINISH'] === undefined) {
          CHECKlistnew.push(CHECKlist[i]);
        }
      }
      // console.log(CHECKlistnew);
      for (i = 0; i < CHECKlistnew.length; i++) {
        for (j = 0; j < MACHINEmaster.length; j++) {
          if (CHECKlistnew[i]['METHOD'] === MACHINEmaster[j]['masterID']) {
            if (MACHINEmaster[j]['MACHINE'].length > 0) {
              INSLIST.push(...MACHINEmaster[j]['MACHINE']);
            }
          }
        }
      }

      INSLISTans = [...new Set(INSLIST)];
      if(INSLISTans.length === 0){
        let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": "pass", } });
      }else if(INSLISTans.length ===1){
        // if(INSLISTans[0] === 'Other'){
        //   let feedbackupdateFINISH = await mongodb.update(MAIN_DATA, MAIN, { "PO": input['PO'] }, { "$set": { "ALL_DONE": "DONE", "PO_judgment": "pass", } });
        // }
      }
    }
    catch (errin) {
      if (findcp.length > 0) {
        for (i = 0; i < findcp[0]['FINAL'].length; i++) {
          ITEMMETHODlist.push({ "ITEMs": findcp[0]['FINAL'][i]['ITEMs'], "METHOD": findcp[0]['FINAL'][i]['METHOD'] })
        }

        METHODmaster = await mongodb.find(master_FN, METHOD, {});
        MACHINEmaster = await mongodb.find(master_FN, MACHINE, {});

        for (i = 0; i < ITEMMETHODlist.length; i++) {
          for (j = 0; j < METHODmaster.length; j++) {
            if (ITEMMETHODlist[i]['METHOD'] === METHODmaster[j]['METHOD']) {
              for (k = 0; k < MACHINEmaster.length; k++) {
                if (METHODmaster[j]['METHOD'] === MACHINEmaster[k]['masterID']) {
                  if (MACHINEmaster[k]['MACHINE'].length > 0) {
                    INSLIST.push(...MACHINEmaster[k]['MACHINE']);
                  }
                }
              }
            }
          }
        }
        INSLISTans = [...new Set(INSLIST)];
        
      }else{
        INSLISTans = [];
      }
    }
  }


  //-------------------------------------
  return  res.json(INSLISTans);
});

//         "PO": "",
//         "CP": "",
//         "QTY": "",
//         "PROCESS": "",
//         "CUSLOT": "",
//         "TPKLOT": "",
//         "FG": "",
//         "CUSTOMER": "",
//         "PART": "",
//         "PARTNAME": "",
//         "MATERIAL": "",

router.post('/GETfg', async (req, res) => {
  //-------------------------------------
  console.log('--GETfg--');
  console.log(req.body);
  let input = req.body;
  //-------------------------------------
  let output = {};
  let findfg = [];
  let findPO = [];
  let ITEMMETHODlist = [];
  let METHODmaster = [];
  let MACHINEmaster = [];
  let INSLIST = [];
  let INSLISTans = [];


  if (input['FG'] !== undefined ) {
    findfg = await mongodb.find(PATTERN, PATTERN_01, { "FG": input['FG'] });
  
    INSLISTans = findfg

    // if(findcp.length === 0 ){
    //   findcp = await mongodb.find(PATTERN, PATTERN_01, { "FG": input['CP'] });
    // }

  }

  console.log(INSLISTans);

  //-------------------------------------
  res.json(INSLISTans);
});



module.exports = router;