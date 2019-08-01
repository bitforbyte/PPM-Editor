#!/usr/bin/env python3
import sys
import math

# Kendall Nicley
# COSC 365 Prog. Languages
# Lab 6: PPM Editor using python
# This lab is to take input to alter a PPM image
# The alterations are mirror along x and y axis
# and invert the color of the image


#Pixel class the will contian the values of the pixels
#and will return the color values of the pixel
class Pixel:
	def __init__(self, red, green, blue):
		self.codic = {"r":red,"g":green,"b":blue}

#Accesors and Mutators that will get and set the pixel color value
	def setRed(self, arg): #Red pixel
		self.codic["r"] = arg
	def getRed(self):
		return self.codic["r"]
	def setGreen(self, arg): #Green Pixel
		self.codic["g"] = arg
	def getGreen(self):
		return self.codic["g"]
	def setBlue(self, arg): # Blue Pixel
		self.codic["b"] = arg
	def getBlue(self):
		return self.codic["b"]

#The PPM class that will hold the functions
class PPM:
	#Default overloaded constructor that will assign the image width
	# and height and create an empty list for the pixels
	def __init__(self, w, h, mi):
		self.width = w
		self.height = h
		self.maxI = mi
		self.pixlist= []
	
	#This function is to invert the color of each pixel
	# Within the pixel list.
	def invert(self):
		#Get the value of the maximum intensity to use in the inversion
		max = self.getMaxIntensity()

		#Loop through the pixels and subtract from the Maximum intesity to get
		# Inverted value
		for y in range(0, self.getHeight()):
			for x in range(0, self.getWidth()):
				pix = self.getPixel(x,y)

				#get RGB values
				r = pix.getRed()
				g = pix.getGreen()
				b = pix.getBlue()

				# Invert the values in each color
				pix.setRed(max - r)
				pix.setGreen(max - g)
				pix.setBlue(max - b)
		
	#This function will mirror the given image along the y axis
	#It will loop halfway throught the rows and swap the pixels left over right
	def flipHorizontal(self):
		#Loop through the columns
		for y in range(0, self.getHeight()):
			#loop through the rows
			for x in range(0, int(math.floor(self.getWidth()/2))):
				# Set the pixel to tmp
				tmp = self.getPixel(x,y)
				# swap the pixels
				self.setPixel(x,y,(self.getPixel((x*-1)-1, y)))
				self.setPixel((x*-1)-1,y,(tmp))



	#Function will mirror along the x axis
	#It will loop halfway through the height and swap the top and bottom half
	def flipVertical(self):
		mid = int(math.floor(self.getHeight()/2));
		# for each of the columns
		for y in range(0, int(math.floor(self.getHeight()/2))):
			#loop throught each of the rows
			for x in range(0, self.getWidth()):
				#swap the pixels
				tmp = self.getPixel(x,y)
				self.setPixel(x,y,(self.getPixel(x, (y * -1)-1)));
				self.setPixel(x,(y * -1)-1,(tmp));
				
	#Add pixel to the internal list
	def addPixel(self, Pixel):
		self.pixlist.append(Pixel)

	#Remove the pixels from the list
	def clearPixels(self):
		self.pixlist.clear()

	#Return the pixel from the internal list
	def getPixel(self, x, y):
		#Do a bound test and throw error if there is a problem
		if x > self.width or y > self.height:
			raise IndexOutOfRangeException

		# Calculate the index
		index = x + y * self.width
		try:
			return self.pixlist[index]
		except ValueError:
			print(ValueError)
	
	#Set the pixel to the given value
	def setPixel(self, x,y,Pixel):
		# bound check of the rows and columns throw error if over
		if x > self.width or y > self.height:
			raise IndexOutOfRangeException
		else:
			#calculate index for setting
			index = x + y * self.width
			try:
				self.pixlist[index] = Pixel
			except ValueError:
				print(ValueError)


	#Return the height of the image
	def getHeight(self):
		return self.height

	#Return the width of the image
	def getWidth(self):
		return self.width

	#Return the Maximum Intensity of the image
	def getMaxIntensity(self):
		return self.maxI

#This function will read the given file and create the values
def readFile(inFile):
	file = open(inFile, "r")
	file.readline().strip()
	
	#Read the Width and Height
	val = file.readline().strip().split()
	wid = int(val[0])
	height = int(val[1])

	#Read the maximum intensity
	val = file.readline().strip()
	maxi = int(val)

	#Create the ppm editor and pass with width, height, and max intensity
	ppm = PPM(wid, height, maxi) 

	#For each line in the file
	for line in file:
		val = line.strip().split() #Split each line to list elements(not encluding \n)
		red = int(val[0]) #Assign the red pixel
		green = int(val[1]) #Assign the green pixel
		blue = int(val[2]) #Assign the blue pixel
		ppm.addPixel(Pixel(red,green,blue))

	return ppm
		
#Write the new PPM File
def writePPM(fileName,ppm):

	#Open and write to the given output file
	file = open(fileName, "w")
	file.write("P3\n")
	file.write(str(ppm.getWidth()) + " " + str(ppm.getHeight()) + "\n")
	file.write(str(ppm.getMaxIntensity()) + "\n")

	
	#Scan through each columns
	for y in range(0, ppm.getHeight()):
		#Scan through each row
		for x in range(0, ppm.getWidth()):
			#write each of the pixels to the file
			#print(x + ppm.getWidth() * y)
			pix = ppm.getPixel(x,y)
			file.write(str(pix.getRed()) + " " + str(pix.getGreen()) + " " + str(pix.getBlue()) + "\n")
	
#create the PPM Image
def createPPM(argv):

	#Bound check the input
	if (len(argv) < 4):
		print("Error: Not enough arguments")
		print("  ./PPMEditor inputFile outputFile {Flag(V,FH,FV,or N)}")
		print("  Exiting!")
		return 0;

	#assign the given inputs
	inputF = argv[1]
	outputF = argv[2]
	ppm = readFile(inputF)
	
	#Determine which flag was given and do approiate action
	if (argv[3] == "V"):
		ppm.invert()
	elif (argv[3] == "FH"):
		ppm.flipHorizontal()
	elif (argv[3] == "FV"):
		ppm.flipVertical()
	elif (argv[3] == "N"):
		ppm = ppm
	
	#Call the writer to the file
	writePPM(outputF, ppm)	
	
#Main function
def main():
	createPPM(sys.argv)
	return 0

#main()
if __name__ == "__main__":
	exit(main())
