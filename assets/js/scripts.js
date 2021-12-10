// Função para limpar tabela de busca
function clearSearch() {
	$("#table-search").html("");
}

// Função de estados
function estadoErrado() {
	$('#box').removeClass('acerto');
	$('#box').addClass('erro');
}
function estadoAceito() {
	$('#box').addClass('acerto');
	$('#box').removeClass('erro');
}

function sublinhaLinhaEstado(state, letter) {
	$('#automato tr').removeClass('estado_selecionado');
	$('#automato td').removeClass('letra_selecionada');
	$('#automato .estado_' + state).addClass('estado_selecionado');
	$('#automato .letra_' + letter).addClass('letra_selecionada');
}

// Arrays para armazenamento de informações
var Palavras = [];
var Estados = [[]];
var EstadoGlobal = 0;
var EstadoIteracao = [0];
var Tabela = [];

function inserePalavra() {
	var token = $("#input-insere").val();
	if (token) { //Testa se tem algo escrito(válido)
		if (Palavras.indexOf(token) < 0 && token.length > 0) { //Testa se ja existe a palavra no dicionário
			$("#table-palavras").append("<tr class=tk-" + token + "><td>" + token + "</td><td><span class='badge badge-danger badge-icon' onclick=\"removeToken('" + token + "')\"><i class='fa fa-times' aria-hidden='true'></i></span></td></tr>")
			Palavras.push(token);
			$("#input-insere").val("");
		}
	}
	verifica_estados();
	Tabela = gerar_linhas();
	html_tabela(Tabela);

	$('#buscar').keyup(function (e) {
		if (Tabela.length > 0) {
			valida_palavra(e);
		}
	});
}

// Função para remover caracteres especiais
function removeCaracteres() {
	var primeiro = 'a';
	var ultimo = 'z';
	var token = $("#input-insere").val();

	if (token.slice(-1) == " " || !(token.slice(-1).charCodeAt(0) >= primeiro.slice(-1).charCodeAt(0) && token.slice(-1).charCodeAt(0) <= ultimo.slice(-1).charCodeAt(0))) {
		$("#input-insere").val(token.replace(token.slice(-1), ''));
	}
}

/**
 * Remove token da Array Tokens
 * @param String token 
 * @return Nova tabela formatada
 */
function removeToken(token) {
	var index = Palavras.indexOf(token);
	if (index >= 0 && token.length > 0) {
		Palavras.splice(index, 1);
		$(".tk-" + token).hide();
	}

	//Limpa tudo e refaz
	$("#automato").html("");
	Estados = [[]];
	EstadoGlobal = 0;
	EstadoIteracao = [0];
	Tabela = [];
	verifica_estados();
	Tabela = gerar_linhas();
	html_tabela(Tabela);
}

// Função para montar estados a partir das palavras digitadas
function verifica_estados() {
	for (var i = 0; i < Palavras.length; i++) {
		var estado_atual = 0;
		var palavra_vetor = Palavras[i];
		for (var j = 0; j < palavra_vetor.length; j++) {
			if (typeof Estados[estado_atual][palavra_vetor[j]] === 'undefined') {
				var proximo_estado = EstadoGlobal + 1;
				Estados[estado_atual][palavra_vetor[j]] = proximo_estado;
				Estados[proximo_estado] = [];
				EstadoGlobal = estado_atual = proximo_estado;
			} else {
				estado_atual = Estados[estado_atual][palavra_vetor[j]];
			}

			if (j == palavra_vetor.length - 1) {
				Estados[estado_atual]['final'] = true;
			}
		};
	};
}

// Função para montar linhas
function gerar_linhas() {
	var vetor_estados = [];
	for (var i = 0; i < Estados.length; i++) {
		var aux = [];
		aux['estado'] = i;
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			if (typeof Estados[i][letra] === 'undefined') {
				aux[letra] = '-'
			} else {
				aux[letra] = Estados[i][letra]
			}
		}
		if (typeof Estados[i]['final'] !== 'undefined') {
			aux['final'] = true;
		}
		vetor_estados.push(aux);
	};
	// console.log(vetor_estados);
	return vetor_estados;
}

// Função para transferir tabela de valores para HTML do index
function html_tabela(vetor_estados) {
	tabela = $('#automato');
	tabela.html('');
	// Define o cabeçalho da tabela
	var tr = $(document.createElement('tr'));
	var th = $(document.createElement('th'));
	th.html('Estado'); // Adiciona o titulo da coluna de estado
	tr.append(th);
	var primeiro = 'a';
	var ultimo = 'z';
	for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) { // Adiciona todas as letras no cabeçalho da tabela
		var th = $(document.createElement('th'));
		th.html(String.fromCharCode(j));
		tr.append(th);
	}
	tabela.append(tr);

	// Itera entre os estados
	for (var i = 0; i < vetor_estados.length; i++) {
		var tr = $(document.createElement('tr')); // Cria uma nova linha para cada estado
		var td = $(document.createElement('td')); // Cria a celula do estado
		if (vetor_estados[i]['final']) {
			td.html('q' + vetor_estados[i]['estado'] + '*');
		} else {
			td.html('q' + vetor_estados[i]['estado']);
		}
		tr.append(td);
		tr.addClass('estado_' + vetor_estados[i]['estado']);
		var primeiro = 'a';
		var ultimo = 'z';
		for (var j = primeiro.charCodeAt(0); j <= ultimo.charCodeAt(0); j++) {
			var letra = String.fromCharCode(j);
			var td = $(document.createElement('td'));
			td.addClass('letra_' + letra);
			if (vetor_estados[i][letra] != '-') {
				td.html('q' + vetor_estados[i][letra]);
			}
			tr.append(td);
		}
		tabela.append(tr);
	}
}

/**
 * Valida as entradas vindas do campo de digitação
 * @param String event 
 */
function valida_palavra(event) {
	var primeiro = 'a'; // Para saber se o que está digitado é válido
	var ultimo = 'z';
	var palavras = $('#buscar').val(); // Pega o valor do campo
	if (palavras.length == 0) { // Verifica se o campo está vazio, assim ele reseta todos os efeitos na tabela
		$('#box').removeClass('acerto');
		$('#box').removeClass('erro');
		$('#automato tr').removeClass('estado_selecionado');
		$('#automato td').removeClass('letra_selecionada');
	}
	var estado = 0; // Inicia a verificação pelo estado inicial
	var letter_error = false;
	for (var i = 0; i < palavras.length; i++) {
		// Verifica se o dígito está entre a - z
		if (palavras[i].charCodeAt(0) >= primeiro.charCodeAt(0) && palavras[i].charCodeAt(0) <= ultimo.charCodeAt(0) && letter_error == false) {
			sublinhaLinhaEstado(estado, palavras[i]);
			if (Tabela[estado][palavras[i]] != '-') { // se o estado não for de erro, ele aceita
				estado = Tabela[estado][palavras[i]];
				estadoAceito();
			} else { // Rejeita caso o estado seja de erro
				estadoErrado();
				letter_error = true;
			}
		} else if (palavras[i] == ' ') { // Caso tenha digitado um espaço
			if (letter_error == false) {
				if (Tabela[estado]['final']) { //Se o estado for final da Encontrado se não da Estado não final
					$("#table-search").append("<tr><td>" + palavras + "</td><td><span class='badge badge-success badge-icon' style='height: 20px'><span>Encontrada</span></span></td></tr>")
				} else {
					$("#table-search").append("<tr><td>" + palavras + "</td><td><span class='badge badge-warning badge-icon' style='height: 20px'><span>Estado não final</span></span></td></tr>")
				}
			} else {
				$("#table-search").append("<tr><td>" + palavras + "</td><td><span class='badge badge-danger badge-icon' style='height: 20px'><span>Não Encontrada</span></span></td></tr>")
			}
			$('#box').removeClass('acerto');
			$('#box').removeClass('erro');
			$('#automato tr').removeClass('estado_selecionado');
			$('#automato td').removeClass('letra_selecionada');
			$('#buscar').val("");
		} else if (letter_error == false) {
			estadoErrado();
			alert('Caractere fora da extensão: ' + palavras[i]); // Se for digitado um caractere fora do epaço de a até z ele dá mensagem dizendo é inválido
		}
	};
}