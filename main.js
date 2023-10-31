class Tempo {
	constructor(anos=0, meses=0, dias=0) {
    this.tempo = anos*360 + meses*30 + dias*1;
  }
	addDias(numero=0)
	{
		this.tempo += numero*1;
	}	
	addMeses(numero=0)
	{
		this.tempo += numero*30;
	}	
	addAnos(numero=0)
	{
		this.tempo += numero*360;
	}
	mesesTotal()
	{
		return this.tempo/30;
	}
	anosTotal()
	{
		return this.tempo/360.0;
	}
	diasTotal()
	{
		return this.tempo;
	}
	dias()
	{
		return Math.trunc(this.tempo%30);
	}
	meses()
	{
		return Math.trunc(this.mesesTotal()%12);
	}
	anos()
	{
		return Math.trunc(this.anosTotal());
	}
	string()
	{
		let texto = [], anos = this.anos(), meses = this.meses(), dias = this.dias();
		if(anos>0) texto.push(anos+" ano(s)");
		if(meses>0) texto.push(meses+" mese(s)");
		if(dias>0) texto.push(dias+" dia(s)");
		if(texto.length == 0) return "0 dias";
		return texto.join(", ").replace(/,([^,]*)$/, " e" + '$1');
	}
}
class Crime {
  constructor(tipo={}, circunstancias={}, ateAgr = [], minMaj = []) {
    this.tipo = tipo;
	this.circunstancias = circunstancias;
	this.ateAgr = ateAgr;
	this.minMaj = minMaj;
  }
  
  addAtenuante(ate={})
  {
	this.ateAgr.push(ate);
  }
  
  addAgravante(agr={})
  {
	this.addAtenuante(agr);
  }
  
  penaBase()
  {
	mostrar("", true);
	mostrar("<li>Crime de "+ this.tipo.nome +", mínima de " + this.tipo.min.string()+" e máxima de " + this.tipo.max.string()+".</li>");
	//mostrar("<h5>1ª Fase:</h5>");
	let min = this.tipo.min;
	let neg = this.circunstancias.negativas();
	let oitavo = this.tipo.umOitavo();
	let tempo = new Tempo(min.anosTotal() + (neg * oitavo.anosTotal()));
	mostrar("<li>Na 1ª fase, "+this.circunstancias.descrever()+"</li>");
	mostrar("<li>Pena entre mínima de " + min.string() + " e termo médio de " + this.tipo.termoMedio().string() + ", acrescentando " + oitavo.string() + " para cada uma das " + neg +" circunstâncias negativas.</li>");
	mostrar("<li><strong>Pena-base fixada em "+ tempo.string()+".</strong></li>");
	//mostrar("<h5>2ª Fase:</h5>");
	
	return tempo;
  }
  
  penaProvisoria()
  {
	let base = this.penaBase();
	let umSexto = base.mesesTotal()/6;
	//let prepS = Math.trunc(umSexto);
	//let prep = Math.trunc(umSexto * 5 / 6);
	//let comum = Math.trunc(umSexto * 3 / 6);
	mostrar("<li>O teto de 1/6 da pena-base equivale a "+(new Tempo(0,umSexto)).string()+".</li>");
	if(this.ateAgr.length == 0) mostrar("<li>Sem agravantes ou atenuantes.</li>");
	for (let ateAgr of this.ateAgr) {
	//MathTrunc
	  let meses = Math.trunc(ateAgr.peso*(umSexto/6)*3)/3;

	  base.addMeses(meses);
	  console.log(meses);
	  if(meses>0)
	  {
		mostrar("<li>Agravante de "+ ateAgr.nome + " (" + ateAgr.valor()+") adicionando " + (new Tempo(0,meses)).string() + " à pena, resultando em " + base.string()+".</li>");
	  }
	  else
	  {
		mostrar("<li>Atenuante de "+ ateAgr.nome + " (" + ateAgr.valor()+") retirando " + (new Tempo(0,-meses)).string() + " à pena, resultando em " + base.string()+".</li>");
	  }
	}
	
	if(this.tipo.min.tempo>base.tempo)
	{
		base.tempo = this.tipo.min.tempo;
		mostrar("<li>Todavia, na 2ª fase, deve ser respeitada a pena mínima de "+ base.string() +"</li>");
	}
	if(this.tipo.max.tempo<base.tempo)
	{
		base.tempo = this.tipo.max.tempo;
		mostrar("<li>Todavia, na 2ª fase, deve ser respeitada a pena máxima de "+ base.string() +"</li>");
	}
	
	mostrar("<li><strong>Pena provisória fixada em "+ base.string()+".</strong></li>");
	//mostrar("<h5>3ª Fase:</h5>");
	return base;
  }
  
  penaDefinitiva()
  {
	let prov = this.penaProvisoria();
	let neg = this.circunstancias.negativas();
	if(this.minMaj.length == 0) mostrar("<li>Sem majorantes ou minorantes.</li>");
	for (let minMaj of this.minMaj) {
	  let frac = minMaj.valorPeso(neg);
	  let meses = (prov.mesesTotal()*(minMaj.peso(neg)/12));
	  prov.addMeses(meses);
	  console.log(frac);
	  if(frac.includes("-"))
	  {
		mostrar("<li>Minorante de "+ minMaj.nome + " reduzindo a pena em " + (new Tempo(0,-meses)).string() + " ("+frac+"), resultando em " + prov.string()+".</li>");
	  }
	  else
	  {
		mostrar("<li>Majorante de "+ minMaj.nome + " aumentando a pena em " + (new Tempo(0,meses)).string() + " ("+frac+"), resultando em " + prov.string()+".</li>");
	  }
	}
	mostrar("<li><strong>Pena definitiva fixada em "+ prov.string()+".</strong></li>");
	html("<h4>Pena: "+ prov.string() +"</h4>", "#penaFinal", true);
	return prov;
  }
  
  
}
class Circunstancias extends Array{
  negativas()
  {
		let neg = 0;
		for(let x in this)
		{
			if(this[x]==-1)neg++;
		}
		
	    return neg;
  }
  descrever()
  {
		let texto = [];
		for(let x in this)
		{
			if(this[x]==-1)texto.push("\"<i>"+x+"\"</i> foi avaliado como negativo");
			else if(this[x]==1)texto.push("\"<i>"+x+"\"</i> foi avaliado como positivo");
			else if(this[x]==0)texto.push("\"<i>"+x+"\"</i> foi avaliado como neutro");
			else texto.push("\"<i>"+x+"\"</i> não foi avaliado");
		}		
	    return texto.join("; ")+".";
  }
}
class Tipo {
  constructor(min, max, nome="") {
    this.min = min;
	this.max = max;
	this.nome = nome;
  }
  termoMedio()
  {
	return new Tempo((this.min.anosTotal() + this.max.anosTotal())/2);
  }
  umOitavo()
  {
	return new Tempo((this.termoMedio().anosTotal() - this.min.anosTotal())/8);
  }
}
class AteAgr {
  constructor(peso=1, nome="") {
	this.peso = peso;
	this.nome = nome;
  }
  valor()
  {
	switch(this.peso)
	{
	case 3:
	case -3:
	return "comum";
	case 5:
	case -5:
	return "preponderante";
	case 6:
	case -6:
	return "super preponderante";
	}
  }
   categoria()
  {
	if(this.peso<0)
	return "atenuante";
	else
	return "agravante";
  }
  
}
class MinMaj {
  constructor(min, max=0, nome="", calc=true) {
    this.min = min;
	this.max = max;
	this.nome = nome;
	this.calc = calc;
	/*
	tudo sobre 12
	1/6 = 2/12
	1/6, 1/3, 1/2, 2/3, 2, 3
	*/
  }
  
  humanize(texto)
  {
	texto = math.simplify(texto).toString().replace(" / ","/");
	if(texto=="1") texto="dobro";
	if(texto=="2") texto="triplo";
	return texto;
  }
  minimo()
  {
	return this.humanize(this.min+"/12");
  }
  
  maximo()
  {
	return this.humanize(this.max+"/12");
  }
    
  valorPeso(culp)
  {
	return this.humanize(this.peso(culp)+"/12");
  }
  
  calcCulp(culp)
	{
	 return Math.trunc(culp/3.0 + 1);
	}
	
  calcPeso(culp, x=false)
  {
	switch (culp)
	{
		case 1:
		case -1:
		case '1':
			if(this.min>=0 || x) return this.min;
			else return this.max;
		case 2:
		case -2:
		case '2':
			return Math.round((this.max+this.min)/2);
		case 3:
		case -3:
		case '3':
			if(this.min>=0 || x) return this.max;
			else return this.min;
	}
	return this.min;
  }
  
  peso(culp)
  {
	if(this.max == 0 || this.max==this.min)
	return this.min;
	
	if(this.calc===true){
		culp = this.calcCulp(culp);
		return this.calcPeso(culp);
	}
	else
	{
		culp = this.calc;
		return this.calcPeso(culp, true)
	}
  }
  
  categoria()
  {
	if(this.min<0)
	return "minorante";
	else
	return "majorante";
  }  
  
  grau()
  {
	if(this.calc===true)	return "";
	if(this.calc == '1')	return "(mínimo)";
	if(this.calc == '2')	return "(médio)";
	if(this.calc == '3')	return "(máximo)";
  }  
  
}

function mostrar(string, substituir = false)
{
	html(string, "#resultado", substituir);
}

function html(string, identificador, substituir=false)
{
	if(!substituir) $(identificador).append(string);
	else $(identificador).html(string);
}
