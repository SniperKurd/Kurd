import os
import tkinter as tk
from tkinter import messagebox, simpledialog

try:
    import qrcode
    from PIL import ImageTk
except Exception:
    qrcode = None
    ImageTk = None

from wallet import SimpleWallet


class WalletApp:
    def __init__(self, master):
        self.master = master
        master.title("Simple Wallet GUI")

        provider = os.environ.get("PROVIDER_URL", "https://mainnet.infura.io/v3/YOUR-PROJECT-ID")
        self.wallet = SimpleWallet(provider)
        self.account = None
        self.mnemonic = None

        self.info_label = tk.Label(master, text="No wallet loaded")
        self.info_label.pack(pady=5)

        self.new_btn = tk.Button(master, text="Create New Wallet", command=self.create_wallet)
        self.new_btn.pack(fill="x")

        self.load_btn = tk.Button(master, text="Load Wallet", command=self.load_wallet)
        self.load_btn.pack(fill="x")

        self.address_label = tk.Label(master, text="")
        self.address_label.pack(pady=5)

        self.copy_btn = tk.Button(master, text="Copy Address", command=self.copy_address, state=tk.DISABLED)
        self.copy_btn.pack(fill="x")

        self.qr_btn = tk.Button(master, text="Show QR", command=self.show_qr, state=tk.DISABLED)
        self.qr_btn.pack(fill="x")

        self.balance_btn = tk.Button(master, text="Check Balance", command=self.check_balance, state=tk.DISABLED)
        self.balance_btn.pack(fill="x")

        tk.Label(master, text="Send ETH").pack(pady=(10,0))
        self.to_entry = tk.Entry(master, width=50)
        self.to_entry.pack(pady=2)
        self.amount_entry = tk.Entry(master, width=20)
        self.amount_entry.pack(pady=2)
        self.send_btn = tk.Button(master, text="Send", command=self.send_eth, state=tk.DISABLED)
        self.send_btn.pack(fill="x")

    def create_wallet(self):
        phrase, acct = self.wallet.create_wallet()
        self.mnemonic = phrase
        self.account = acct
        messagebox.showinfo("Mnemonic", phrase)
        self.address_label.config(text=f"Address: {acct.address}")
        self.info_label.config(text="Wallet loaded")
        self.enable_actions()

    def load_wallet(self):
        phrase = simpledialog.askstring("Mnemonic", "Enter your 12-word phrase")
        if not phrase:
            return
        try:
            acct = self.wallet.load_wallet(phrase)
        except Exception as e:
            messagebox.showerror("Error", str(e))
            return
        self.account = acct
        self.mnemonic = phrase
        self.address_label.config(text=f"Address: {acct.address}")
        self.info_label.config(text="Wallet loaded")
        self.enable_actions()

    def enable_actions(self):
        self.copy_btn.config(state=tk.NORMAL)
        self.qr_btn.config(state=tk.NORMAL if qrcode and ImageTk else tk.DISABLED)
        self.balance_btn.config(state=tk.NORMAL)
        self.send_btn.config(state=tk.NORMAL)

    def copy_address(self):
        if self.account:
            self.master.clipboard_clear()
            self.master.clipboard_append(self.account.address)
            messagebox.showinfo("Copied", "Address copied to clipboard")

    def show_qr(self):
        if not (self.account and qrcode and ImageTk):
            messagebox.showerror("Unavailable", "QR code support not installed")
            return
        qr_img = qrcode.make(self.account.address)
        top = tk.Toplevel(self.master)
        top.title("Wallet Address QR")
        photo = ImageTk.PhotoImage(qr_img)
        lbl = tk.Label(top, image=photo)
        lbl.image = photo
        lbl.pack()

    def check_balance(self):
        if self.account:
            bal = self.wallet.get_balance(self.account.address)
            messagebox.showinfo("Balance", f"{bal} ETH")

    def send_eth(self):
        if not self.account:
            return
        to_addr = self.to_entry.get().strip()
        amount = self.amount_entry.get().strip()
        try:
            value = float(amount)
            tx_hash = self.wallet.send_eth(self.account, to_addr, value)
            messagebox.showinfo("Transaction", tx_hash)
        except Exception as e:
            messagebox.showerror("Error", str(e))


if __name__ == "__main__":
    root = tk.Tk()
    app = WalletApp(root)
    root.mainloop()
