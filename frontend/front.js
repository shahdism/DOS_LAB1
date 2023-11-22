const axios = require('axios');
const readline = require('readline');

const Url = 'http://localhost:7001'; 

async function searchBooksByTopic() {
  const topic = await prompt('Enter the topic to search for: ');
  try {
    const response = await axios.get(`${Url}/search/subject/${topic}`);
    console.log('Search Results:', response.data.books);
  } catch (error) {
    console.error('Error searching books:', error.message);
  }
}

async function getItemInfo() {
  const itemNumber = await prompt('Enter the item number: ');
  try {
    const response = await axios.get(`${Url}/search/item/${itemNumber}`);
    console.log('Item Information:', response.data.books);
  } catch (error) {
    console.error('Error getting item information:', error.message);
  }
}

async function purchaseItem() {
  const itemNumber = await prompt('Enter the item number to purchase: ');
  try {
    const response = await axios.post(`${Url}/purchase/${itemNumber}`);
    console.log('Purchase Successful:', response.data.message);
  } catch (error) {
    console.error('Error purchasing item:', error.message);
  }
}

async function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  const [,, action] = process.argv; 

  if (action === 'SearchBooks') {
    await searchBooksByTopic();
  } else if (action === 'GetItemInfo') {
    await getItemInfo();
  } else if (action === 'PurchaseItem') {
    await purchaseItem();
  } else {
    console.error('Invalid action. Please provide a valid action');
  }
}

main();
