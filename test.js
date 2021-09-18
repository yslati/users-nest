// const sync = () => {
// 	console.log('hello1');
// }

// sync();

// console.log("hello2");

const asyncFunc = () => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve("Hello World 1");
		}, 2000);
	});
}

// asyncFunc()
// 	.then((result) => {
// 		console.log(result);
// 	})
// console.log("Hello World 2");

const test = async () => {
	const result = await asyncFunc();
	console.log(result);
	console.log('hello');
}

test();

console.log('hello1')