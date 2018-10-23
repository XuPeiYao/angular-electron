/**
 * 播放器狀態
 *
 * @export
 * @enum {number}
 */
export enum PlayerStatus {
  /**
   * 正在載入播放器
   */
  Loading,
  /**
   * 正在初始化播放器
   */
  Initiating,
  /**
   * 就緒
   */
  Ready,
  /**
   * 緩衝中
   */
  Buffering,
  /**
   * 開始
   */
  Cued,
  /**
   * 播放中
   */
  Playing,
  /**
   * 暫停
   */
  Paused,
  /**
   * 播放結束
   */
  Ended
}
