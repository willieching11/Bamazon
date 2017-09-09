var inquirer = require('inquirer');
var mysql = require("mysql");
var secret = require("./secret.json");

var action;
var id;
var name;
var department;
var price;
var quantity;
var newQuantity;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: secret.SQL_PASSWORD,
  database: "bamazon"
});

function menu() {
    inquirer.prompt([
      {
	    type: 'list',
	    name: 'action',
	    message: 'Welcome to the Manager Menu! What would you like to do?',
	    choices: [
	      'View Products for Sale',
	      'View Low Inventory',
	      'Add to Inventory',
	      'Add New Product'
	    ]
	  }
	]).then(function (answers) {
	  action = answers.action;
	  if (action === "View Products for Sale") {
		viewProducts();
	  }
	  if (action === "View Low Inventory") {
		viewLowInventory();
	  }
	  if (action === "Add to Inventory") {
		viewProducts();	
	  }
	  if (action === "Add New Product") {
		createProduct();	
	  }
	});
}

function viewProducts() {
	console.log("Selecting all products...\n");
	connection.query("SELECT * FROM products", function(err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		for(var i = 0; i < res.length; i++) {
		  console.log('ID: ' + res[i].item_id + '; Product: ' + res[i].product_name + '; Price: $' +  res[i].price + "; Quantity: " + res[i].quantity);
		}
		if (action === "Add to Inventory") {
			addInventory();
		} else {
			connection.end();
		}
	});
}

function viewLowInventory() {
	console.log("Showing low inventory products...\n");
	connection.query("SELECT * FROM products WHERE quantity < 6", function(err, res) {
		if (err) throw err;
		// Log all results of the SELECT statement
		if (res[0] === undefined) {
			console.log("All products with sufficient quantity!")
		} else {
			for(var i = 0; i < res.length; i++) {
			  console.log('ID: ' + res[i].item_id + '; Product: ' + res[i].product_name + '; Price: $' +  res[i].price + "; Quantity: " + res[i].quantity);
			}
		}
		connection.end();
	});
}

function addInventory() {
	inquirer.prompt([
		{
		  name: "id",
		  message: "What product(ID) would you like to update?"
		}, {
		  name: "quantity",
		  message: "How many would you like to add?"
		}
	]).then(function (answers) {
		id = answers.id;
		quantity = answers.quantity;
		connection.query(
		    "SELECT * FROM products WHERE ?",
		    {
		      item_id: id
		    },
		    function(err, res) {	    	
		    	quantity = parseInt(quantity);
		        newQuantity = res[0].quantity + quantity;      
		        updateProduct();
		    }
	    );
	});
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
		  console.log("Your have updated this product to " + newQuantity + " total units");
		  connection.end();
		}
	);
}

function createProduct() {
	inquirer.prompt([
		{
		  name: "product_name",
		  message: "What is the product's name?"
		}, {
		  name: "department_name",
		  message: "What department is the product in?"
		}, {
		  name: "price",
		  message: "What is the product's price?"
		}, {
		  name: "quantity",
		  message: "How many of this product will be added?"
		}
	]).then(function (answers) {
		name = answers.product_name;
		department = answers.department_name;
		price = answers.price;
		quantity = answers.quantity;
		console.log("Inserting a new product...\n");
		var query = connection.query(
			"INSERT INTO products SET ?",
			{
			  product_name: name,
			  department_name: department,
			  price: price,
			  quantity: quantity
			},
			function(err, res) {
			  console.log(res.affectedRows + " product inserted!\n");
			}
		);
		connection.end();
	});
}

menu();