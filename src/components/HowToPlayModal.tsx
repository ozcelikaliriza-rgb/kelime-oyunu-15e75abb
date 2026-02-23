import { useState } from "react";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

const ExampleTile = ({
  letter,
  variant,
}: {
  letter: string;
  variant: "correct" | "present" | "absent" | "empty";
}) => {
  const bg =
    variant === "correct"
      ? "bg-[hsl(var(--tile-correct))] text-white"
      : variant === "present"
        ? "bg-[hsl(var(--tile-present))] text-white"
        : variant === "absent"
          ? "bg-[hsl(var(--tile-absent))] text-white"
          : "bg-muted text-foreground border border-border";

  return (
    <div
      className={`w-9 h-9 flex items-center justify-center rounded font-extrabold text-sm ${bg}`}
    >
      {letter}
    </div>
  );
};

const HowToPlayModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Nasıl Oynanır?"
          className="flex items-center justify-center w-6 h-6 rounded border border-border bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[85dvh] overflow-y-auto rounded-xl p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">
            Nasıl Oynanır?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            KelimeBul oyun kuralları ve ipuçları
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Rules */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-1">📏 Kurallar</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>4 ile 8 harf arasındaki gizli kelimeyi tahmin et.</li>
              <li>Her seviyede <strong>6 tahmin</strong> hakkın var.</li>
              <li>Tahminler geçerli Türkçe kelimeler olmalıdır.</li>
              <li>Her tahminden sonra kutucukların rengi değişir ve sana ipucu verir.</li>
              <li>Tüm seviyeleri geçerek oyunu tamamla!</li>
            </ul>
          </section>

          {/* Color meanings */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-1.5">🎨 Renk Anlamları</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ExampleTile letter="K" variant="correct" />
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Yeşil:</strong> Harf doğru yerde.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ExampleTile letter="E" variant="present" />
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Sarı:</strong> Harf kelimede var ama yanlış yerde.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ExampleTile letter="L" variant="absent" />
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Gri:</strong> Harf kelimede yok.
                </span>
              </div>
            </div>
          </section>

          {/* Blind Mode */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-1">🙈 Kör Mod (Blind Mode)</h3>
            <p className="text-xs text-muted-foreground">
              Bu modda kutucuk renkleri oyun bitene kadar gizlenir. Ekstra zorluk
              arayanlar için! Renk körlüğü modu ile karıştırılmamalıdır — renk
              körlüğü modu renkleri daha erişilebilir hale getirir.
            </p>
          </section>

          {/* Settings */}
          <section>
            <h3 className="text-sm font-bold text-foreground mb-1">⚙️ Ayarlar</h3>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>
                <strong className="text-foreground">Tema:</strong> Açık ve Koyu mod arasında
                geçiş yapabilirsin.
              </li>
              <li>
                <strong className="text-foreground">Renk Körlüğü Modu:</strong> Göz ikonuna
                tıklayarak renkleri daha erişilebilir hale getirebilirsin.
              </li>
              <li>
                <strong className="text-foreground">Joker:</strong> 7+ harfli seviyelerde
                ipucu kullanabilirsin.
              </li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlayModal;
