const express = require("express");
const router = express.Router();

router.use(require("./flow/001/sap"))
router.use(require("./flow/001/getmaster"))
router.use(require("./flow/001/upqcdata"))
router.use(require("./flow/001/INSFINISH"))
router.use(require("./flow/001/cleardata"))
router.use(require("./flow/001/GRAPHMASTER"))
router.use(require("./flow/001/1-APPGASHES"))
router.use(require("./flow/001/2-HG-HRC-002"))
router.use(require("./flow/001/3-HG-HMV-001"))
router.use(require("./flow/001/4-HG-HMV-002"))
router.use(require("./flow/001/5-HG-HMV-003"))
router.use(require("./flow/001/6-HG-MSC-001"))
router.use(require("./flow/001/7-HG-VHT-001"))


router.use(require("./flow/002/01TOBEREPORT"))
//INSFINISH
// router.use(require("./flow/004/flow004"))
// router.use(require("./flow/005/flow005"))
router.use(require("./flow/testflow/testflow"))

module.exports = router;

