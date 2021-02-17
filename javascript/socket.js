const fs = require("fs");
require("dotenv").config();
const path = require("path");
const shell = require("shelljs");
const io = require("socket.io-client");
const decompress = require("decompress");
const { ipcRenderer } = require("electron");
const tableTemplate = require(path.resolve(
  __dirname + "/../javascript/templates.js"
));
const serverStream = require("socket.io-stream");
const socket = io.connect(`${process.env.hostHTTP}:${process.env.port}`);

socket.on("connect", function () {
  console.log("connected");
  socket.on("identify", () => {
    console.log("identify");
    socket.emit("adm");
  });

  socket.on("broadcast", function (e) {
    console.log(e);
    $("#processAtivityTable").children().remove();
    let computers = `<option value="all">Selecione</option>`;
    e.forEach((el, i) => {
      let vl = "";
      el.scripts.forEach((ele) => {
        vl += `<option value="${ele.folder}">${ele.folder}</option>`;
      });
      computers += `<option value="${el.id}">${el.computer}</option>`;
      $("#processAtivityTable").append(
        tableTemplate.sockets(el.id, el.computer, vl, "Aguardando")
      );
    });
    $("#machines").children().remove();
    $("#machines").append(computers);
  });

  socket.on("to", function (e) {
    let computers = `<option value="all">Selecione</option>`;
    $("#loadingTableItems").children().remove();
    e.forEach((el, i) => {
      computers += `<option value="${el.id}">${el.computer}</option>`;
      $("#loadingTableItems").append(
        tableTemplate.loadingTableRow(el.id, el.computer, "ss", "running")
      );
    });
    $("#machines").children().remove();
    $("#machines").append(computers);
  });

  socket.on("done", () => {
    notify("Sucesso", "arquivo Carregado no servidor");
    $("#sincronize").attr("disabled", false);
  });

  socket.on("node-download", (nodeInfo) => {
    $(`#status${nodeInfo.id}`).text("Baixando");
  });

  socket.on("_extracting", ({ id }) => {
    $(`#status${id}`).text("extraindo");
  });

  socket.on("node-dependencies", (nodeInfo) => {
    $(`#status${nodeInfo.id}`).text("node install");
  });

  socket.on("node-success", (nodeInfo) => {
    $(`#status${nodeInfo.id}`).text("finalizado");
  });

  socket.on("node-error", (nodeInfo) => {
    $(`#status${nodeInfo.id}`).text(`${nodeInfo.error}`);
  });

  socket.on("reposin", (repos) => {
    console.log(repos);
  });
});

function notify(title, msg) {
  let notification = new Notification(title, {
    body: msg,
  });
}

let directory = $("#directory");
let executable = $("#executable");
let name = $("#name");

function originDirectory() {
  ipcRenderer.send("originDirectory");
}

ipcRenderer.on("originDirectory-reply", (event, file) => {
  if (file != false) {
    directory.val(file.path);
    name.val(file.name);
    executable.trigger("focus");
  } else {
    notify("Erro!", "Erro ao buscar caminho do arquivo.");
  }
});

function executableInDirectory() {
  ipcRenderer.send("executableInDirectory", executable.val());
}

ipcRenderer.on("executableInDirectory-reply", (event, execFile) => {
  executable.val(execFile);
  name.trigger("focus");
});

function sendFiles() {
  let pathToFile = $("#directory").val();
  let fileName = $("#name").val();

  var stream = serverStream.createStream();
  stream.on("end", function () {
    console.log("file sent");
  });
  serverStream(socket).emit("sending", stream, fileName);
  fs.createReadStream(pathToFile).pipe(stream);
}

function sendLink() {
  let link = $("#linkRepo").val();
  let provider = $("#Repoprovider").val();
  socket.emit("link", { url: link, service: provider });
}

function sincronize() {
  $("#addScript").modal("hide");
  $("#loadingScripts").modal("show");
  socket.emit("receivingSockets");

  setTimeout(() => {
    socket.emit("spread");
  }, 1500);
}

async function unzip(origin) {
  try {
    const files = await decompress(origin, "./extrated/");
    await execute("./extrated/" + files[0].path);
    notify("sucesso");
  } catch (error) {
    console.log(error);
  }
}

function execute(dir) {
  shell.cd(dir);
  shell.config.execPath = String(shell.which("node"));
  shell.exec(`yarn install`);
}

$("#addScript").on("hidden.bs.modal", () => {
  name.val("");
  directory.val("");
  executable.val("");
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
  console.log(selectedScript);
  console.log("inst", instancesScript);
  console.log("sc", selectedScript);
  socket.emit("start-script", {
    socket: pid,
    instances: instancesScript,
    script: selectedScript,
  });
}
