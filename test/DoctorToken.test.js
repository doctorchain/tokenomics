import assertRevert from './helpers/assertRevert'

const DoctorToken = artifacts.require('DoctorToken')
// import {eventEmitted} from 'truffle-assertions'

contract('DoctorToken', function (accounts) {
    let doc
    const name = 'Doctor Coin'
    const symbol = 'DOC'
    const decimals = 18

    beforeEach(async function () {
        doc = await DoctorToken.new(name, symbol, decimals, {from: accounts[0]})
    })

    it('should set owner to the sender', async function () {
        let owner = await doc.owner()
        assert.isTrue(owner === accounts[0])
    })

    it('should able to transfer ownership to other', async function () {
        let other = accounts[1]
        await doc.transferOwnership(other)
        assert.isTrue(await doc.owner() === other)
    })

    it('should prevent non-owners from transfering', async function () {
        const other = accounts[2]
        const owner = await doc.owner()
        assert.isTrue(owner !== other)
        await assertRevert(doc.transferOwnership(other, {from: other}))
    })

    it('should guard ownership against stuck state', async function () {
        let originalOwner = await doc.owner()
        await assertRevert(doc.transferOwnership(null, {from: originalOwner}))
    })
})
