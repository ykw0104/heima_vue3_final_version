/* 邮箱校验规则 */
export const checkEmail = (rule, value, callback) => {
  const regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
  if (regEmail.test(value)) {
    callback();
  } else {
    callback(new Error("邮件格式不正确"));
  }
};

/* 手机校验规则 */
export const checkMobile = (rule, value, callback) => {
  const regMobile =
    /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
  if (regMobile.test(value)) {
    callback();
  } else {
    callback(new Error("手机号格式不正确"));
  }
};