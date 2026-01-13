// Funções utilitárias
function limparCampo(id) {
  document.getElementById(id).value = "";
}

function limparTodos() {
  ['nome', 'cpf', 'cep', 'endereco', 'numero', 'telefone', 'dataCompra', 'valor'].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("recibo").style.display = "none";
  document.getElementById("recibo").innerHTML = "";
  document.getElementById("btnPrint").style.display = "none";
}

// Máscaras e formatação de campos
document.getElementById("cpf").addEventListener("input", function () {
  let cpf = this.value.replace(/\D/g, '').slice(0, 11);
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  this.value = cpf;
});

document.getElementById("telefone").addEventListener("input", function () {
  let tel = this.value.replace(/\D/g, '').slice(0, 11);
  tel = tel.replace(/^(\d{2})(\d)/g, "($1) $2");
  tel = tel.replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  this.value = tel;
});

const dataCompraInput = document.getElementById("dataCompra");
dataCompraInput.addEventListener("input", function () {
  let value = dataCompraInput.value.replace(/\D/g, "");
  if (value.length > 2 && value.length <= 4) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  } else if (value.length > 4) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
  }
  dataCompraInput.value = value;
});

// Formatação da data por extenso
function dataExtenso(data) {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const partes = data.split("/");
  if (partes.length !== 3) return data;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const ano = partes[2];
  if (isNaN(dia) || isNaN(mes)) return data;
  return `${dia < 10 ? '0' + dia : dia} de ${meses[mes - 1]} de ${ano}`;
}

// Validação simples de CPF
function validarCPF(cpf) {
  return /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf);
}

// Consulta de CEP via ViaCEP
function buscarEndereco() {
  let cep = document.getElementById("cep").value.replace(/\D/g, '');
  if (cep.length !== 8) {
    alert("CEP inválido! Deve ter 8 números.");
    return;
  }
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        alert("CEP não encontrado! Preencha manualmente.");
        document.getElementById("endereco").value = "";
      } else {
        const enderecoFormatado = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
        document.getElementById("endereco").value = enderecoFormatado;
      }
    })
    .catch(() => alert("Erro ao consultar CEP! Preencha manualmente."));
}

// Geração do recibo
function gerar() {
  const nome = document.getElementById("nome").value.trim();
  const cpf = document.getElementById("cpf").value.trim();
  const cep = document.getElementById("cep").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const numero = document.getElementById("numero").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const dataCompra = document.getElementById("dataCompra").value.trim();
  const valor = document.getElementById("valor").value.trim();

  if (!nome || !cpf || !endereco || !numero || !telefone || !dataCompra || !valor) {
    alert("Preencha todos os campos antes de gerar o recibo!");
    return;
  }

  if (!validarCPF(cpf)) {
    alert("CPF inválido! Digite no formato XXX.XXX.XXX-XX");
    return;
  }

  const dataCompraExtenso = dataExtenso(dataCompra);

  const hoje = new Date();
  const diaHoje = String(hoje.getDate()).padStart(2, '0');
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0');
  const anoHoje = hoje.getFullYear();
  const dataHojeExtenso = dataExtenso(`${diaHoje}/${mesHoje}/${anoHoje}`);

  const mensagem = `
    <div>
      <div class="imagem">
        <img src="cabecalho.jpg" alt="Logo" style="display:block; width:100%;" />
      </div>
      <div class="recibo">
        <h1>RECIBO TROCA DE PRODUTOS</h1>
        <p><b>Nome:</b> ${nome}</p>
        <p><b>CPF:</b> ${cpf}</p>
        <p><b>Endereço:</b> ${endereco}, Nº ${numero}</p>
        <p><b>CEP:</b> ${cep}</p>
        <p><b>Telefone:</b> ${telefone}</p>
        <hr />
        <p><span class="check">&#10003;</span> Nome do titular da Compra: ${nome}</p>
        <p><span class="check">&#10003;</span> CPF: ${cpf}</p>
        <p><span class="check">&#10003;</span> DECLARO TER RECEBIDO DE MASTER FORMULA <b>FARMÁCIA DE MANIPULAÇÃO LTDA</b>, CNPJ/MF: <b>71.678.963/0001-30</b>, COM ENDEREÇO NA <b>PRAÇA DA REPÚBLICAS, 276, CENTRO, SÃO PAULO</b>, SP, O PRODUTO OU PRODUTOS TROCADOS:</p>
        <p>VALOR TOTAL: <b>R$ ${valor}</b></p>
        <p>DATA DA COMPRA: <b>${dataCompraExtenso}</b></p>
        <P>EM CONCORDÂNCIA COM A LEI Nº 13.709/18 - LEI GERAL DE PROTEÇÃO DE DADOS, DECLARO CONSENTIR COM O COMPARTILHAMENTO DOS MEUS DADOS PESSOAIS EXCLUSIVAMENTE PRA COMPROVAR AUTENTICIDADE DO PEDIDO DE TROCA DE PRODUTOS.</P>
        <P>AO ASSINAR O TERMO, O TITULAR CONSENTE QUE SEUS DADOS SERÃO TRATADOS EXCLUSIVAMENTE PARA A FINALIDADE DE TROCA OU DEVOLUÇÃO DE PRODUTOS.</P>
    

        <p>Em <b>São Paulo, ${dataHojeExtenso}</b></p>
        <p class="assinatura">Assinatura do titular: ______________________________________</p>
	 <p>Nº DANFE: _____________________</p>
      </div>
      <div style="text-align:center; margin-top:290px;">
        <img src="rodape.jpg" alt="Rodapé" style="width: 100%; max-width: 600px;" />
      </div>
    </div>
  `;

  const divRecibo = document.getElementById("recibo");
  divRecibo.innerHTML = mensagem;
  divRecibo.style.display = "block";

  document.getElementById("btnPrint").style.display = "inline-block";
  divRecibo.scrollIntoView({ behavior: "smooth" });
}

// Impressão
function imprimir() {
  window.print();
}
