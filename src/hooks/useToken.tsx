import { useUserStore } from '@/store/user';
import { localStorageGetter } from '@/utils/helper';
import { get } from "lodash-es";

export const useToken = () => {
  const userData = useUserStore.getState();
  const authorization = localStorageGetter('system_data', 'authorization');
  return userData.user.authorization || authorization;
}

export const useVerification = (key: string) => {
  const userPermsData = get(useUserStore, 'use.user.perms') || localStorageGetter('system_data', 'perms');
  return userPermsData?.includes(key);
}