pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract DoctorToken is ERC20, Ownable {
    using SafeMath for uint256;

    uint256 constant private MAX_UINT256 = 2 ** 256 - 1;
    string public name;
    string public symbol;
    uint8 public decimals;
    mapping(address => uint256) internal balances;
    uint256 internal total;
    mapping(address => mapping(address => uint256)) internal allowed;

    constructor(string _name, string _symbol, uint256 _total, uint8 _decimals) public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        total = _total;
        balances[owner] = total;
        emit Transfer(address(0), owner, total);
    }

    function totalSupply() public view returns (uint256) {
        return total;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function transfer(address _to, uint _value) public returns (bool success) {
        require(_value <= balances[msg.sender]);
        require(_to != address(0));

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint _value) public returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
        uint256 allowance = allowed[_from][msg.sender];
        require(_value <= balances[_from]);
        require(_value <= allowance);
        require(_to != address(0));

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        if (allowance < MAX_UINT256) {
            allowed[_from][msg.sender] -= _value;
        }
        emit Transfer(_from, _to, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function() public payable {
        revert();
    }
}