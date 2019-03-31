import numpy as np
import matplotlib.pyplot as plt

x = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0]
y1 = [0.188, 0.189, 0.189, 0.187, 0.188, 0.188]
y2 = [0.435, 0.495, 0.615, 0.691, 0.840, 0.879]

y = np.vstack([y1, y2])

labels = ["REINFORCE", "Pragmatic REINFORCE"]

fig = plt.figure()
plt.plot(x, y1, y2, labels=labels)
plt.legend(loc='upper left')
plt.show()

# fig, ax = plt.subplots()
# ax.plot(x, y)
# plt.show()