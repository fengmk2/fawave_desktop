# FaWave 代码备忘

## i18n

* 原来FaWave_Chrome里面语言文件里面的 `comm_***` 命名方式全部修改为 `***` 方式，例如 `comm_add` 修改为 `add`

## Account信息

* Account信息保存在`accounts.db`文件中
* 登陆成功后，会把Account信息保存到`FaWave.Cache.Properties`缓存中
* 可以通过 `FaWave.Accounts.current` 来获取当前登陆的账号信息

## User信息（微博账号信息）

* User信息保存在 `users_%s.db` 中，其中 `s%` 为Account的用户名