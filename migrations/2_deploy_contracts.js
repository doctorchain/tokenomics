const DoctorToken = artifacts.require('DoctorToken.sol')

module.exports = function(deployer) {
    deployer.deploy(DoctorToken, 'Doctor Token', 'DOC', 18)
}
