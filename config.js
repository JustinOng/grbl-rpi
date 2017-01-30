module.exports = {
  // file containing http://www.linux-usb.org/usb.ids
  usb_id_list: "usb.ids.txt",
  uart_rate: 115200,
  // in ms, documentation says no more than 5Hz
  status_report_poll_interval: 1000,

  GRBL_RX_BUFFER_SIZE: 127
}
