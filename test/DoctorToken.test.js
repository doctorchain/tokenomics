import assertRevert from './helpers/assertRevert'

const DoctorToken = artifacts.require('DoctorToken')
// import {eventEmitted} from 'truffle-assertions'

contract('DoctorToken', function (accounts) {
    let doc
    const name = 'Doctor Coin'
    const symbol = 'DOC'
    const decimals = 18
    const total = 2000000000
    let creator = accounts[0]
    let spender = accounts[3]

    beforeEach(async function () {
        doc = await DoctorToken.new(name, symbol, total, decimals, {from: creator})
    })

    it('should set owner to the sender', async () => {
        let owner = await doc.owner()
        assert.isTrue(owner === creator)
    })

    it('should able to transfer ownership to other', async () => {
        let other = accounts[1]
        await doc.transferOwnership(other)
        assert.isTrue(await doc.owner() === other)
    })

    it('should prevent non-owners from transfering', async () => {
        const other = accounts[2]
        const owner = await doc.owner()
        assert.isTrue(owner !== other)
        await assertRevert(doc.transferOwnership(other, {from: other}))
    })

    it('should guard ownership against stuck state', async () => {
        let originalOwner = await doc.owner()
        await assertRevert(doc.transferOwnership(null, {from: originalOwner}))
    })

    it('should able to get the total supply of the token', async () => {
        assert.equal(await doc.totalSupply(), total)
    })

    it('should able deposit all the token to the creator', async () => {
        assert.equal(await doc.balanceOf(creator), total)
    })

    it('should able create the token contract with the info supplied', async () => {
        assert.equal(await doc.name(), name)
        assert.equal(await doc.symbol(), symbol)
        assert.equal(await doc.decimals(), decimals)
    })

    it('should reject ether transfer and revers transaction', async () => {
        const balanceBefore = await doc.balanceOf(creator)
        assert.strictEqual(balanceBefore.toNumber(), total)

        let ethBalanceBefore = await web3.eth.getBalance(creator)

        await assertRevert(new Promise((resolve, reject) => {
            web3.eth.sendTransaction({
                from: creator,
                to: doc.address,
                value: web3.toWei('10', 'Ether')
            }, (err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res)
            })
        }))

        const balanceAfter = await doc.balanceOf(creator)
        assert.strictEqual(balanceAfter.toNumber(), total)

        let ethBalanceAfter = await web3.eth.getBalance(creator)
        assert.closeTo(ethBalanceAfter.toNumber(), ethBalanceBefore.toNumber(), 4600000)
    })

    it('should able to transfer expected amount to target account', async () => {
        let targetAccount = accounts[1]
        let tx = await doc.transfer(targetAccount, 10000)
        const balanceAfter = await doc.balanceOf(targetAccount)
        assert.strictEqual(balanceAfter.toNumber(), 10000)

        const transferLog = await tx.logs.find(element => element.event.match('Transfer'))
        assert.strictEqual(transferLog.args.from, creator)
        assert.strictEqual(transferLog.args.to, targetAccount)
        assert.strictEqual(transferLog.args.value.toString(), '10000')
    })

    it('should able to reject when balance is not sufficient', async () => {
        let targetAccount = accounts[1]
        await assertRevert(doc.transfer(targetAccount, total + 1))
    })

    it('should able transfer zero amount when transfer', async () => {
        let targetAccount = accounts[1]
        let tx = await doc.transfer(targetAccount, 0, {from: creator})

        assert.strictEqual((await doc.balanceOf(targetAccount)).toNumber(), 0)

        const transferLog = await tx.logs.find(element => element.event.match('Transfer'))
        assert.strictEqual(transferLog.args.from, creator)
        assert.strictEqual(transferLog.args.to, targetAccount)
        assert.strictEqual(transferLog.args.value.toString(), '0')
    })

    it('should able to approve amount for the spender', async () => {
        let tx = await doc.approve(spender, 10000, {from: creator})


        assert.strictEqual((await doc.allowance(creator, spender)).toNumber(), 10000)

        const transferLog = await tx.logs.find(element => element.event.match('Approval'))
        assert.strictEqual(transferLog.args.owner, creator)
        assert.strictEqual(transferLog.args.spender, spender)
        assert.strictEqual(transferLog.args.value.toString(), '10000')
    })

    it('should able to transferFrom within approved amount', async () => {
        await doc.approve(spender, 10000, {from: creator})

        let tx = await doc.transferFrom(creator, spender, 10000, {from: spender});

        assert.strictEqual((await doc.allowance(creator, spender)).toNumber(), 0)
        assert.strictEqual((await doc.balanceOf(spender)).toNumber(), 10000)

        const transferLog = await tx.logs.find(element => element.event.match('Transfer'))
        assert.strictEqual(transferLog.args.from, creator)
        assert.strictEqual(transferLog.args.to, spender)
        assert.strictEqual(transferLog.args.value.toString(), '10000')
    })

    it('should able to transferFrom multiple times within approved amount', async () => {
        await doc.approve(spender, 10000, {from: creator})

        await doc.transferFrom(creator, spender, 5000, {from: spender})
        await doc.transferFrom(creator, spender, 5000, {from: spender})
    })

    it('should able to reject transferFrom beyond the approved amount', async () => {
        await doc.approve(spender, 10000, {from: creator})

        await doc.transferFrom(creator, spender, 5000, {from: spender})
        assertRevert(doc.transferFrom(creator, spender, 6000, {from: spender}))
    })

    it('should able to reject transferFrom when no approved amount', async () => {
        assertRevert(doc.transferFrom(creator, spender, 1, {from: spender}))
    })

    it('should overwrite the approval to zero and revert the transferFrom', async () => {
        await doc.approve(spender, 10000, {from: creator})
        await doc.approve(spender, 0, {from: creator})

        assertRevert(doc.transferFrom(creator, spender, 1, {from: spender}))
    })

    it('should able to reject transferFrom when owner amount insufficient', async () => {
        let targetAccount = accounts[1]
        await doc.transfer(targetAccount, total - 10, {from: creator})
        await doc.approve(spender, 10000, {from: creator})

        assertRevert(doc.transferFrom(creator, spender, 20, {from: spender}))
    })

    it('should not change the approval quota when the approval quota above the max int', async () => {
        await doc.approve(spender, '115792089237316195423570985008687907853269984665640564039457584007913129639935', {from: creator})
        await doc.transferFrom(creator, spender, 200, {from: spender})
        const allowance = await doc.allowance(creator, spender)
        assert(allowance.equals('1.15792089237316195423570985008687907853269984665640564039457584007913129639935e+77'))
    })
})
