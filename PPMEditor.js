#!/usr/bin/env nodejs
//Kendall Nicley
//Cosc 365 Lab 5 PPM Editor
//This lab is to make a image editor
//for .ppm files and will be able
//to mirror along x and y axis and invert
//the colors

'use strict';

const fs = require('fs');

//Main function
function main(argc, argv)
{
	//calling process
	processPPM(argc,argv);


	return argc;
}

//Process is the entry point for the PPM processor and will
//manage the given flags and create the required components
function processPPM(argc, argv)
{
	if (argv.length > 4)
	{
		var inputF = argv[2];
		var outputF = argv[3];
		var flag = argv[4];
		

		//Read the file	
		var data = readPPM(inputF, outputF, flag);

	}else
		console.log("Error to Few arguments given. Exiting!");

	return 0;
}

//Write the new PPM to the file
function writePPM(ppm, outputF)
{
	//Create the stream to write the file
	var fout = fs.createWriteStream(outputF, {flags: 'w', encoding: 'utf8', fd: null, mode:0o644});

	//Close the file
	fout.on('close', () => {console.log("File Closed");});

	fout.write(`P3\n${ppm.getWidth()} ${ppm.getHeight()}\n${ppm.getMaxIntensity()}\n`,'utf8');

	var numRows = ppm.getHeight();
	var numCols = ppm.getWidth();
	//Read through each of the rows and columns
	for (var row = 0; row < numRows; row++)
	{
		for (var col = 0; col < numCols; col++)
		{
			var pix = ppm.getPixel(row,col);
			//console.log(pix.getRed() + " " + pix.getGreen() + " " + pix.getBlue());
			fout.write(`${pix.getRed()} ${pix.getGreen()} ${pix.getBlue()}\n`);
		}
	}
}


//Function to create the PPM from the given file
function readPPM(inputF, outputF, flag)
{
	//String to be passed
	var ret = "";

	//Create the stream reader for the file
	var stream = fs.createReadStream(inputF, {flags: 'r', encoding: 'utf8'});	

	//Error check the file
	stream.on('error', function() {console.log(`Error: ${inputF} Does not exists. Exiting!`)})
	//Holder for ppm values
	stream.on('data', (chunk) => 
			{
				//Convert chunk to string and add to buffer
				ret = ret.concat(chunk.toString('utf8'));
			}); //End of Fin.on Data function


	stream.on('close', () =>
			{
				var ppm;
				//This is before the timer implementation
				//ppm = processFile(ret, outputF, flag);	
				//writePPM(ppm, outputF);

				//Create a timer for processing file
				var id = setImmediate(function()
				{
					ppm = processFile(ret, outputF, flag);	
					
				});
				
				//Wait a second to allow the setImmediate to work
				setTimeout(() => {if(ppm !== null)
									writePPM(ppm, outputF)}, 1);
			});
			

}

function processFile(buffer, outFile, flag)
{
	//Replace new line with spaces and break into elements seperated by spaces
	var data = buffer.replace(new RegExp("\n", 'g')," ").split(" ");

	//Read The header and Creat the PPM
	var width = data[1];
	var height = data[2];
	var MaxI = data[3];
	var ppm = new PPM(width, height, MaxI);

	
	
	//Read through the data and assign the pixel
	for(var i = 4; i < data.length - 1; i+= 3)
	{
		//Read each pixel in the file
		var pix = new Pixel(data[i], data[i+1], data[i+2]);
		ppm.addPixel(pix); //Add to the internal array
	}

	//Read the flags
	if (flag === "V") //Invert the given ppm file
		ppm.invert()
	else if (flag === "FH") //Flip around the y axis
		ppm.flipHorizontal();
	else if (flag === "FV") //Flip around the X axis
		ppm.flipVertical();
	else if(flag !== "N") //If it's N for nothing, then it's an error
	{
		console.log(`Error: Unidentified Flag: ${flag}\n Exiting!`);
		return null;
	}

	return ppm;

}

//Pixel class that contains the Pixel properties
//and accessors and mutators
class Pixel
{
	constructor(r=0,g=0,b=0,)
	{
		this.redChan = r;
		this.greenChan = g;
		this.blueChan = b;
	}

	//Mutators and accessors for the pixel colors
	getRed()  { return this.redChan; };
	setRed(i)  { this.redChan = i; };
	getGreen() { return this.greenChan; };
	setGreen(i) { this.greenChan = i; };
	getBlue() { return this.blueChan; };
	setBlue(i) { this.blueChan = i; };
}

class PPM
{
	//array of pixels and values height, width, 
	constructor(w,h,mi)
	{
		this.Height = h;
		this.Width = w;
		this.MaxIntensity = mi;
		this.pixlist =[];
	}

	//This function will subtract the color from
	//the maximum Intensity to get the oppisite color
	invert()
	{
		var max = this.getMaxIntensity();

		//Read through each of the rows and columns
		var numRows = this.getHeight();
		var numCols = this.getWidth();
		var pix;
		for (var row = 0; row < numRows; row++)
		{
			for (var col = 0; col < numCols; col++)
			{
				//Get the pixel and set the color
				pix = this.getPixel(row,col);
				pix.setRed(max-pix.getRed());
				pix.setGreen(max-pix.getGreen());
				pix.setBlue(max-pix.getBlue());
			}
		}
	}

	//This function will scan each row and swap the
	//pixels around the center(left to right) and mirror
	//the image horizontally
	flipHorizontal()
	{
		//get the size of image
		var numRows = this.getHeight();
		var numCols = this.getWidth();
		for (var row = 0; row < numRows; row++) //Scan the rows
		{
			for (var col = 0; col < numCols/2; col++) //Scan the columns
			{
				//Get the pixels to swap and swap them
				var pix = this.getPixel(row, col);
				var tmp = this.getPixel(row, numCols - (col+1));
				this.setPixel(row,col, tmp);
				this.setPixel(row,numCols - (col + 1), pix);
			}
		}

	}
	
	//This function will scan each col and swap each pixels
	//around the center(top to bottom) and mirror the image
	//vertically
	flipVertical()
	{
		//get the size of image
		var numRows = this.getHeight();
		var numCols = this.getWidth();
		for (var row = 0; row < numRows/2; row++) //Scan the rows
		{
			for (var col = 0; col < numCols; col++) //Scan the columns
			{
				//Get and set the pixels to be swapped
				var pix = this.getPixel(row, col);
				var tmp = this.getPixel(numRows - (row+1), col);
				this.setPixel(row,col, tmp);
				this.setPixel(numRows - (row + 1), col, pix);
			}
		}
	}
	
	//Add Pixel to the pixel list
	addPixel(pix) { this.pixlist.push(pix);}

	//Delete the array of pixels
	clearPixels() { this.pixlist=[]; }

	//Return the pixel at the x,y value
	getPixel(x,y)
	{
		//Calculate the index
		var index = x * this.Width + y;

		//Check the index to make sure it's valid
		if (index > this.pixlist.length)
		{throw({name:"IndexOutOfRangeException", message:`Index was out of range of the pixel array: X:${x} Y:${y} Index:${index} length:${this.pixlist.length}`})}
		else
			return this.pixlist[index];
	}

	//Set the pixel at the x,y and assign the given pixel class
	setPixel(x,y,pix)
	{
		//Calculate the index
		var index = x * this.Width + y;
		
		//Check if index is within the approiate range
		if (index > this.pixlist.length)
		{throw({name:"IndexOutOfRangeException", message:"Index was out of range of the pixel array"})}
		else
			this.pixlist[index] = pix;

	}

	getHeight() { return this.Height; } //Height of the image
	getWidth() { return this.Width; } //The width of the image
	getMaxIntensity() { return this.MaxIntensity; } //The maximum Intensity
}

//Call the function 
const ret = main(process.argv.length, process.argv);
