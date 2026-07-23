import { signal, WritableSignal } from '@angular/core';

export class TimerUtil {
  timeLeft: WritableSignal<number> = signal(0);
  display: WritableSignal<string> = signal('05:00');
  
  private timerInterval: any;

  start(seconds: number, onComplete?: () => void) {
    this.stop(); 
    
    this.timeLeft.set(seconds);
    this.updateDisplay();

    this.timerInterval = setInterval(() => {
      const current = this.timeLeft();
      
      if (current > 0) {
        this.timeLeft.set(current - 1);
        this.updateDisplay();
      } else {
        this.stop();
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  private updateDisplay() {
    const time = this.timeLeft();
    const m = Math.floor(time / 60);
    const s = time % 60;
    const formatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    this.display.set(formatted);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}