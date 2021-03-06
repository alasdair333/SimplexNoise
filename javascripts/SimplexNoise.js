/*
	Author: Alasdair MacLeod
	SimplexNoise Algorithm:
	Based on the paper: http://webstaff.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
	
	Other helpful websites: 
	http://freespace.virgin.net/hugo.elias/models/m_perlin.htm

	I hope it will be useful to you as it is to me! :)

	TODO: 
	Add seeded random so the same image can be retrieved. 
*/

function Log10(val) {
  return Math.log(val) / Math.LN10;
}

/* 
	Function: SimplexOctave
	This function is a single pass of a noise image. This is called 
	as many times as you wish. 
*/
function SimplexOctave (seed)
{
	var RANDOMSEED = 0;
	var NUMBEROFSWAPS = 400;
	var grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
	 [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
	 [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];

	 //Contains all the numbers between 0 & 255
	var p = [151,160,137,91,90,15,
	 131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	 190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	 88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	 77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	 102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	 135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	 5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	 223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	 129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	 251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	 49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	 138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

	var perm = [];

	// TODO: Add a seeded random generator to the code. 
	/*if(seed == RANDOMSEED)
	{
		seed = Math.rand(); 
	}*/

	for(var i=0; i < NUMBEROFSWAPS; i++)
	{
		var swapFrom = Math.floor(Math.random() * p.length) ; 
		var swapTo = Math.floor(Math.random() * p.length);

		var temp = p[swapFrom];
		p[swapFrom] = p[swapTo];
		p[swapTo] = temp;
	}

	// To remove the need for index wrapping, double the permutation table length
	for(var i=0; i<512; i++)
	{
		perm[i]=p[i & 255];	
	} 

	//Not sure how much "faster" this is :\
	this.FastFloor = function(x) {
		return x > 0? parseInt(x, 10) : parseInt(x-1, 10);
	};

	this.Dot = function(g, x, y)
	{
		return g[0]*x + g[1]*y;
	};

	this.Noise = function(xin, yin)
	{
		var n0 = 0, n1 = 0, n2 = 0; //Noise contributions from 3 corners
		var F2 = 0.5*(Math.sqrt(3.0)-1.0); 
		var s = (xin+yin)*F2;
		var i = this.FastFloor(xin+s); 
		var j = this.FastFloor(yin+s); 

		var G2 = (3.0-Math.sqrt(3.0))/6.0;
		var t = (i+j)*G2; 
		var X0 = i-t; 
		var Y0 = j-t;
		var x0 = xin - X0;
		var y0 = yin - Y0; 

		var i1 = 0, j1 = 0;
		if(x0>y0)
		{
			i1 = 1; 
			j1 = 0;
		} 
		else
		{
			i1 = 0;
			j1 = 1; 
		}

		var x1 = x0 - i1 + G2; 
		var y1 = y0 - j1 + G2;
		var x2 = x0 - 1.0 + 2.0 * G2; 
		var y2 = y0 - 1.0 + 2.0 * G2; 

		var ii = (i & 255);
		var jj = (j & 255);
		var gi0 = perm[ii+perm[jj]] % 12;
		var gi1 = perm[ii+i1+perm[jj+j1]] % 12;
		var gi2 = perm[ii + 1 + perm[jj+1]] % 12;

		var t0 = 0.5 - x0*x0-y0*y0; 
		if(t0 < 0) {
			n0 = 0.0;
		}
		else
		{
			t0 *= t0; 
			n0 = t0 * t0 * this.Dot(grad3[gi0], x0, y0); 
		}

		var t1 = 0.5 - x1*x1-y1*y1;
		if(t1 < 0) {
			n1 = 0.0;
		}
		else
		{
			t1 *= t1; 
			n1 = t1 * t1 * this.Dot(grad3[gi1], x1, y1); 
		}

		var t2 = 0.5 - x2*x2-y2*y2;

		if(t2 < 0)
		{
			n2 = 0.0;
		}
		else
		{
			t2 *= t2;
			n2 = t2 * t2 * this.Dot(grad3[gi2], x2, y2); 
		}

		return 70.0 * (n0 + n1 + n2); 
	};
};

/*
	Function: SimplexNoise
	This function runs through several iterations of the 
	SimplexOctave function above adding the results
	together.

*/
function SimplexNoise(largestFeature, persistence, seed) {

	octaves= new Array();
	frequencies= new Array();
	amplitudes= new Array();

	largestFeature = largestFeature;
	persistence = persistence;
	seed = seed; 

	var numberOfOctaves = Math.ceil(Log10(largestFeature)/Log10(2));

	for(var i =0; i < numberOfOctaves; i++)
	{
		octaves[i] = new SimplexOctave(Math.random());
		frequencies[i] = Math.pow(2,i);
		amplitudes[i] = Math.pow(persistence, octaves.length-i); 
	}

	this.GetNoise = function (x, y) {

		var result = 0;

		for(var i = 0; i < octaves.length; i++)
		{
			result = result+octaves[i].Noise(x/frequencies[i], y/frequencies[i]) * amplitudes[i];
		}

		return result;
	}
};

//Simple Scale function to convert from normalised -1..1 up to 0..255
function Scale(minRange, maxRange, minNormal, maxNormal, output)
{
	return minRange + ((output - minNormal) * (maxRange - minRange) / (maxNormal - minNormal));
}


function CreateGradient()
{
	var image = [];

	var xResolution = 512; 
	var yResolution = 512; 

	var gradient = 0;

	for (var y = 0; y < yResolution; y++)
	{
		gradient = Scale(0, 255, 0, 255, y); 

		for(var x = 0; x < xResolution; x++)
		{
			image.push(gradient);
		}
	}
	
	return image; 
}

function Select(image, amount)
{
	var img = image; 
	for(var i = 0; i < img.length; i++)
	{
		if(img[i] < amount)
		{
			img[i] = 0;
		}
		else
		{
			img[i] = 255; 
		}
	}

	return img; 
}

function ScaleOffset(image, scale, offset)
{
	var img = image;
	for(var i = 0; i < img.length; i++)
	{
		img[i] = img[i] * scale + offset; 
	}

	return img;
}

function ScaleDomain(image, xscale, yscale)
{
	var img = [];
	var img2 = []; 

	for(var i = 0; i < 512; i++)
	{
		img2.push(image[i]);
	}

	for(var y = 1; y < 512; y++)
	{
		for(var x = 0; x < 512; x++)
		{
			img.push(img2[x]);
		}	
	}

	return img;
}

function TranslateDomain(srcImage, ty)
{
	var img = [];
	for(var i = 0; i < srcImage.length; i++)
	{
		img.push(srcImage[i] + ty[i]);
	}

	return img; 
}

function Combiner(Img1, Img2)
{
	var img = []; 

	for(var i = 0; i < Img1.length; i++)
	{

		if(Img1[i] > 0 && Img2[i] > 0)
		{
			img.push(255);	
		}
		else
		{
			img.push(0); 
		}
	}
	return img; 
}

function Inverter(Img)
{
	var img = [];

	for(var i = 0; i < Img.length; i++)
	{
		if(Img[i] >= 128)
		{
			img.push(0); 
		}
		else
		{
			img.push(255); 
		}
	}

	return img; 
}

/*
	Function: createImage

*/
function CreateImage()
{
	var image = [];

	var ms = new Date(); 
	var simplexNoise = new SimplexNoise(20000, 0.4, ms.getTime());

	var xStart = 0; 
	var xEnd = 256;
	var yStart = 0;
	var yEnd = 256; 

	var xResolution = 512;
	var yResolution = 512; 

	for(var i=0; i< xResolution; i++)
	{
		for(var j = 0; j < yResolution; j++){
			var x = (xStart+i*((xEnd-xStart)/xResolution));
			var y = (yStart+j*((yEnd - yStart)/yResolution));

			var output = 0.5*(1+simplexNoise.GetNoise(x,y));

			image.push(Scale(0,255,-1,1,output));
		}
	}

    return image; 
}

function CreateRidged() 
{
	var image = CreateImage(); 

	var halfRange = 255/2; 

	for(var i = 0; i < image.length; i++)
	{
		var swapped = image[i] - halfRange;
		image[i] = halfRange + swapped; 

		//image[i] = image[i] > 10 ? image[i] : 0; 
	}

	return image; 
}

