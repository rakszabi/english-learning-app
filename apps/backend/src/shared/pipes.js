const statusPipe = (value) => {
  if (value === "PENDING") return "függőben";
  if (value === "PROCESSING") return "folyamatban";

  if (value === "READ") return "olvasott";
  if (value === "UNREAD") return "olvasatlan";

  if (value === "PUBLISHED") return "közzétéve";
  if (value === "DRAFT") return "vázlat";
  if (value === "DELETED") return "törölve";

  if (value === "ACTIVE") return "aktív";
  if (value === "INACTIVE") return "inaktív";
  if (value === "IMAGE") return "kép";
  if (value === "FILE") return "file";

  if (value === "ADMIN") return "admin";
  if (value === "USER") return "felhasználó";

  return value;
};

const customDatePipe = (value) => {
  const month =
    new Date(value).getMonth() + 1 < 10
      ? `0${new Date(value).getMonth() + 1}`
      : `${new Date(value).getMonth() + 1}`;

  const day =
    new Date(value).getDate() < 10
      ? `0${new Date(value).getDate()}`
      : `${new Date(value).getDate()}`;

  let date = `${new Date(value).getFullYear()}. ${month}. ${day}.`;

  return date;
};

const customDatetimePipe = (value) => {
  const month =
    new Date(value).getMonth() + 1 < 10
      ? `0${new Date(value).getMonth() + 1}`
      : `${new Date(value).getMonth() + 1}`;

  const day =
    new Date(value).getDate() < 10
      ? `0${new Date(value).getDate()}`
      : `${new Date(value).getDate()}`;

  const hour =
    new Date(value).getHours() < 10
      ? `0${new Date(value).getHours()}`
      : `${new Date(value).getHours()}`;

  const min =
    new Date(value).getMinutes() < 10
      ? `0${new Date(value).getMinutes()}`
      : `${new Date(value).getMinutes()}`;

  let date = `${new Date(
    value
  ).getFullYear()}. ${month}. ${day}. ${hour}:${min}`;

  return date;
};

const thousandPipe = (value) => {
  value = value === 0 ? 0 : value === "" ? "" : value;
  value =
    value === 0 ? 0 : value === "" ? "" : String(value).replace(/\s/g, "");
  value = value === 0 ? 0 : value === "" ? "" : String(parseInt(String(value)));
  return value === 0
    ? "0"
    : value === ""
    ? ""
    : String(value).replace(/(?!^)(?=(?:\d{3})+$)/g, " ");
};

module.exports = {
  statusPipe,
  customDatePipe,
  customDatetimePipe,
  thousandPipe,
};
