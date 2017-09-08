var inquirer = require('inquirer');
var mysql = require("mysql");
var id;
var quantity;
var newQuantity;
var totalPrice;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

function readProducts() {
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    for(var i = 0; i < res.length; i++) {
      console.log('ID: ' + res[i].item_id + '; Product: ' + res[i].product_name + '; Price: $' +  res[i].price);
    }
    start();
  });
}

function start() {
  inquirer.prompt([
    {
      name: "id",
      message: "What product(ID) would you like to buy?"
    }, {
      name: "quantity",
      message: "How many would you like to buy?"
    }
  ]).then(function (answers) {
      id = answers.id;
      quantity = answers.quantity;
      buyProducts();
  });
}

function buyProducts() {
  console.log("Checking your products...\n");
  connection.query(
    "SELECT * FROM products WHERE ?",
    {
      item_id: id
    },
    function(err, res) {
      if (res[0].quantity >= quantity) {
        console.log("Success!\n");
        newQuantity = res[0].quantity - quantity;
        totalPrice = (res[0].price * quantity);
        totalPrice.toFixed(2);
        console.log(totalPrice);

        updateProduct();
      }
      else {
        console.log("Sorry, insufficient quality! We have " + res[0].quantity + " of that product left");
        connection.end();
      }
    }
  );
}

function updateProduct() {
  console.log("Updating all quantities...\n");
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        quantity: newQuantity
      },
      {
        item_id: id
      }
    ],
    function(err, res) {
      console.log("Your total cost is $" + totalPrice + " plux tax!");
      connection.end();
    }
  );
}

readProducts();