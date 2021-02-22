const fs = require("fs");
require("dotenv").config();
const path = require("path");
const shell = require("shelljs");
const io = require("socket.io-client");
const { ipcRenderer } = require("electron");
const templates = require(path.resolve(
  __dirname + "/../javascript/templates.js"
));

const scriptUpload = $("#addScript");
const uploadScriptModal = $("#addScript");
const scriptInstall = $("#loadingScripts");
const btnInstallScript = $("#btnInstallScript");
const serverStream = require("socket.io-stream");
const util = require(path.resolve(__dirname + "/../javascript/util.js"));
const activeSocketsList = $("#processAtivityTable");
const socket = io.connect(`${process.env.hostHTTP}:${process.env.port}`);

let scriptName = $("#name");
let scriptExecutable = $("#executable");
let scriptToUploadPath = $("#directory");
let uploadFeedback = $("#uploadFeedback");
let btnCancelUpload = $("#btnCancelUpload");
let btnUploadScript = $("#btnUploadScript");
let socketsToInstall = $("#socketsToInstall");
let arrayInputs = [scriptToUploadPath, scriptName, scriptExecutable];

let warningIcon = path.resolve(__dirname + "./icons/alert-circle.svg");
let successIcon = path.resolve(__dirname + "/../icons/a.png");
let errorIcon = path.resolve(__dirname + "/../icons/x-circle.svg");

let sending = "";
let recieving = "";

socket.on("connect", function () {
  socket.on("identify-client", () => {
    socket.emit("administrator");
  });

  socket.on("server-new-connected-client", function (clients) {
    templates.connectedSockets(activeSocketsList, clients);
  });

  socket.on("server-disconnected-client", function (id) {
    console.log("dsd");
    $(`#remove${id}`).remove();
  });

  socket.on("server-download-on-client-started", (id) => {
    $(`#pid_status${id}`).text("Baixando");
  });

  socket.on("server-decompress-on-client-started", (id) => {
    $(`#pid_statuss${id}`).text("extraindo");
  });

  socket.on("server-dependencies-on-client-started", (id) => {
    $(`#pid_status${id}`).text("node install");
  });

  socket.on("server-successfuly-installed-on-client", (clients) => {
    templates.connectedSockets(activeSocketsList, clients);
    $(`#pid_status${clients.id}`).text("finalizado");
  });

  socket.on("server-error-on-client", ({ id, error }) => {
    console.log(id);
    console.log(erro);
    $(`#pid_status${id}`).text(`${error}`);
  });

  socket.on("server-script-completely-downloaded", () => {
    notifySuccess("Sucesso", "arquivo Carregado no servidor");
    clearInterval(recieving);
    uploadFeedback.text("Envio realizado!");
    btnInstallScript.attr("disabled", false);
    btnUploadScript.attr("disabled", true);
    btnCancelUpload.attr("disabled", true);
  });

  socket.on("server-sockets-to-install", function (data) {
    templates.installScriptOnCliet(socketsToInstall, data.clients, data.file);
  });
});

function notifySuccess(title, msg) {
  let notification = new Notification(title, {
    body: msg,
    icon: successIcon,
    timeoutType: "default",
  });
}

function notifyError(title, msg) {
  let notification = new Notification(title, {
    body: msg,
    icon: errorIcon,
    timeoutType: "default",
  });
}

function notifyWarning(title, msg) {
  let notification = new Notification(title, {
    body: msg,
    icon: warningIcon,
    timeoutType: "default",
  });
}

function originDirectory() {
  ipcRenderer.send("originDirectory");
}

ipcRenderer.on("originDirectory-reply", (event, file) => {
  if (file != false) {
    scriptToUploadPath.val(file.path);
    scriptName.val(file.name);
    scriptExecutable.trigger("focus");
  } else {
    notifyError("Erro!", "Erro ao buscar caminho do arquivo.");
  }
});

function executableInDirectory() {
  ipcRenderer.send("executableInDirectory", scriptExecutable.val());
}

ipcRenderer.on("executableInDirectory-reply", (event, execFile) => {
  scriptExecutable.val(execFile);
  scriptName.trigger("focus");
});

function uploadScriptToServer() {
  if (!util.validate(arrayInputs)) {
    try {
      sending = templates.Sending(uploadFeedback);
      var stream = serverStream.createStream();
      stream.on("end", function () {
        clearInterval(sending);
        sending = "";
        notifySuccess("Sucesso!", `Script ${scriptName.val()} enviado.`);
      });
      stream.on("error", function (error) {
        notify(
          "Erro!",
          `Falhao ao carregar arquivo ${scriptName.val()}. ${error}`
        );
      });
      serverStream(socket).emit("upload-to-server", stream, {
        name: scriptName.val(),
        exec: scriptExecutable.val(),
      });
      fs.createReadStream(scriptToUploadPath.val()).pipe(stream);
    } catch (error) {}
  }
}

function sendLink() {
  let link = $("#linkRepo").val();
  let provider = $("#Repoprovider").val();
  socket.emit("link", { url: link, service: provider });
}

function installScript() {
  scriptUpload.modal("hide");

  setTimeout(() => {
    socket.emit("administrator-install-in-all-sockets");
  }, 1500);
}

function execute(dir) {
  shell.cd(dir);
  shell.config.execPath = String(shell.which("node"));
  shell.exec(`yarn install`);
}

uploadScriptModal.on("hidden.bs.modal", () => {
  scriptName.val("");
  scriptExecutable.val("");
  scriptToUploadPath.val("");
  uploadFeedback.text("");
  scriptName.removeClass().addClass("form-control");
  scriptExecutable.removeClass().addClass("form-control");
  scriptToUploadPath.removeClass().addClass("form-control");
  btnCancelUpload.attr("disabled", false);
  btnUploadScript.attr("disabled", false);
  btnInstallScript.attr("disabled", true);
});

function changeProvider(provider) {
  if (provider == "github") {
    $("#iconProvider").html(feather.icons["github"].toSvg());
  } else {
    $("#iconProvider").html(feather.icons["gitlab"].toSvg());
  }
}

function searchInfo() {
  socket.emit("each-computer");
}

const menuItems = ["home", "dash", "scripts", "add"];

function activeLink(active) {
  menuItems.forEach((link) => {
    if (link === active) {
      $(`#${link}`).addClass("active");
      $("#mainSection").load(`./${link}.html`);
    } else {
      $(`#${link}`).removeClass("active");
    }
  });
}

function activeScript(pid) {
  let selectedScript = $(`#script_${pid}`).val();
  let instancesScript = $(`#instances_${pid}`).val();
  socket.emit("run-script-on-client", {
    socket: pid,
    instances: instancesScript,
    script: selectedScript,
  });
}
